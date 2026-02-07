'use server'

import { prisma } from '@/lib/prisma'
import { ProgramCategory, ProgramType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { invalidateConfigCache } from '@/lib/config'
import { hash } from 'bcryptjs'

// --- Program Management ---

export async function createProgram(data: {
    name: string
    description?: string
    type: ProgramType
    category: ProgramCategory
    minMembers: number
    maxMembers: number
    volunteerIds?: string[]
}) {
    try {
        const program = await prisma.program.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                category: data.category,
                minMembers: data.minMembers,
                maxMembers: data.maxMembers,
                isActive: true,
                volunteers: data.volunteerIds ? {
                    connect: data.volunteerIds.map(id => ({ id }))
                } : undefined
            }
        })
        revalidatePath('/programs')
        return { success: true, data: program }
    } catch (error) {
        console.error('Failed to create program:', error)
        return { success: false, error: 'Failed to create program' }
    }
}

export async function updateProgram(id: string, data: {
    name?: string
    description?: string
    type?: ProgramType
    category?: ProgramCategory
    minMembers?: number
    maxMembers?: number
    isActive?: boolean
    volunteerIds?: string[] // Optional for update
}) {
    const { volunteerIds, ...updateData } = data
    try {
        const program = await prisma.program.update({
            where: { id },
            data: {
                ...updateData,
                volunteers: volunteerIds ? {
                    set: volunteerIds.map(id => ({ id }))
                } : undefined
            }
        })
        revalidatePath('/programs')
        return { success: true, data: program }
    } catch (error) {
        console.error('Failed to update program:', error)
        return { success: false, error: 'Failed to update program' }
    }
}

export async function deleteProgram(id: string) {
    try {
        await prisma.program.delete({
            where: { id }
        })
        revalidatePath('/programs')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete program:', error)
        return { success: false, error: 'Failed to delete program' }
    }
}

// --- Configuration Management ---

export async function getConfigs() {
    try {
        const configs = await prisma.configuration.findMany({
            orderBy: { key: 'asc' }
        })
        return { success: true, data: configs }
    } catch (error) {
        console.error('Failed to fetch configs:', error)
        return { success: false, error: 'Failed to fetch configs' }
    }
}

export async function updateConfig(key: string, value: string) {
    try {
        const config = await prisma.configuration.update({
            where: { key },
            data: { value }
        })
        invalidateConfigCache()
        revalidatePath('/')
        return { success: true, data: config }
    } catch (error) {
        console.error('Failed to update config:', error)
        return { success: false, error: 'Failed to update config' }
    }
}


export async function createConfig(data: { key: string, value: string, description?: string }) {
    try {
        const config = await prisma.configuration.create({
            data
        })
        return { success: true, data: config }
    } catch (error) {
        console.error('Failed to create config:', error)
        return { success: false, error: 'Failed to create config' }
    }
}

export async function deleteConfig(key: string) {
    try {
        await prisma.configuration.delete({
            where: { key }
        })
        invalidateConfigCache()
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete config:', error)
        return { success: false, error: 'Failed to delete config' }
    }
}

// --- User Management ---

export async function getAllUsers(params?: {
    query?: string
    role?: 'ALL' | 'STUDENT' | 'VOLUNTEER' | 'ADMIN' | 'MASTER'
    page?: number
    limit?: number
}) {
    const { query, role, page = 1, limit = 50 } = params || {}
    const skip = (page - 1) * limit

    try {
        const where: any = {}

        if (query) {
            where.OR = [
                { fullName: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { studentAdmnNo: { contains: query, mode: 'insensitive' } }
            ]
        }

        if (role && role !== 'ALL') {
            where.role = role
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    house: { select: { name: true } }
                }
            }),
            prisma.user.count({ where })
        ])

        return { success: true, data: { users, total, page, limit } }
    } catch (error) {
        console.error('Failed to fetch all users:', error)
        return { success: false, error: 'Failed to fetch all users' }
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        })
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete user:', error)
        return { success: false, error: 'Failed to delete user' }
    }
}

export async function updateUser(id: string, data: any) {
    try {
        // Clean up empty strings for nullable fields
        const cleanedData = { ...data };
        if (cleanedData.houseId === '') cleanedData.houseId = null;
        if (cleanedData.phone === '') cleanedData.phone = null;
        if (cleanedData.department === '') cleanedData.department = null;
        if (cleanedData.semester === '') cleanedData.semester = null;

        const user = await prisma.user.update({
            where: { id },
            data: cleanedData
        })
        revalidatePath('/')
        return { success: true, data: user }
    } catch (error) {
        console.error('Failed to update user:', error)
        return { success: false, error: 'Failed to update user' }
    }
}
export async function createUser(data: {
    fullName?: string
    email: string
    password?: string
    phone?: string
    role?: 'STUDENT' | 'VOLUNTEER' | 'ADMIN' | 'MASTER'
    houseId?: string
    department?: string
    semester?: string
    studentAdmnNo?: string
    gender?: 'MALE' | 'FEMALE' | 'OTHER'
}) {
    try {
        const { password, ...userData } = data
        const hashedPassword = password ? await hash(password, 10) : await hash('Welcome@123', 10)

        // For ADMIN/MASTER, fill in missing required fields if not provided
        const finalRole = data.role || 'STUDENT'
        const isStaff = finalRole === 'ADMIN' || finalRole === 'MASTER'

        const finalData = {
            ...userData,
            role: finalRole,
            fullName: data.fullName || (isStaff ? data.email.split('@')[0] : ''),
            studentAdmnNo: data.studentAdmnNo || (isStaff ? `STAFF_${data.email.split('@')[0]}_${Math.random().toString(36).substring(2, 6)}`.toUpperCase() : ''),
            gender: data.gender || 'MALE',
            password: hashedPassword,
            houseId: data.houseId || null,
            phone: data.phone || null,
            department: data.department || null,
            semester: data.semester || null,
        }

        const user = await prisma.user.create({
            data: finalData as any
        })
        revalidatePath('/')
        return { success: true, data: user }
    } catch (error) {
        console.error('Failed to create user:', error)
        return { success: false, error: 'Failed to create user' }
    }
}
