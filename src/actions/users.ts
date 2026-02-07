'use server'

import { prisma } from '@/lib/prisma'

export async function searchTeamMembers(query: string, houseId: string, currentUserId: string) {
    if (!query || query.length < 2) return { success: true, data: [] }

    try {
        const users = await prisma.user.findMany({
            where: {
                houseId: houseId,
                NOT: {
                    id: currentUserId
                },
                OR: [
                    { fullName: { contains: query, mode: 'insensitive' } },
                    { studentAdmnNo: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 5,
            select: {
                id: true,
                fullName: true,
                studentAdmnNo: true,
                department: true
            }
        })

        return { success: true, data: users }
    } catch (error) {
        console.error('Search failed:', error)
        return { success: false, error: 'Search failed' }
    }
}

export async function getHouseMembers(houseId: string, currentUserId: string) {
    try {
        const users = await prisma.user.findMany({
            where: {
                houseId: houseId,
                NOT: {
                    id: currentUserId,
                    role: { in: ['ADMIN', 'VOLUNTEER', 'MASTER'] } // Exclude non-students if necessary, though roles allows students.
                }
            },
            orderBy: {
                fullName: 'asc'
            },
            select: {
                id: true,
                fullName: true,
                studentAdmnNo: true,
                department: true
            }
        })

        return { success: true, data: users }
    } catch (error) {
        console.error('Failed to fetch house members:', error)
        return { success: false, error: 'Failed to fetch house members' }
    }
}

export async function getUsersForAdmin(params: {
    query?: string
    houseId?: string
    department?: string
    hasRegistrations?: boolean
    page?: number
    limit?: number
    volunteerId?: string
    attendanceStatus?: 'ALL' | 'PRESENT' | 'ABSENT' | 'NOT_MARKED'
}) {
    const { query, houseId, department, hasRegistrations, page = 1, limit = 20, volunteerId, attendanceStatus } = params
    const skip = (page - 1) * limit

    try {
        const where: any = {
            role: 'STUDENT'
        }

        // Volunteer Logic
        let assignedProgramIds: string[] = []
        if (volunteerId) {
            const volunteer = await prisma.user.findUnique({
                where: { id: volunteerId },
                include: { assignedPrograms: { select: { id: true } } }
            })
            if (volunteer && volunteer.assignedPrograms) {
                assignedProgramIds = volunteer.assignedPrograms.map(p => p.id)
            }
        }

        if (query) {
            where.OR = [
                { fullName: { contains: query, mode: 'insensitive' } },
                { studentAdmnNo: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        }

        if (houseId && houseId !== 'ALL') {
            where.houseId = houseId
        }

        if (department && department !== 'ALL') {
            where.department = department
        }

        // Complex registration filtering
        let registrationWhere: any = null

        if (volunteerId) {
            registrationWhere = { programId: { in: assignedProgramIds } }
        }

        if (attendanceStatus && attendanceStatus !== 'ALL') {
            registrationWhere = registrationWhere || {}
            if (attendanceStatus === 'PRESENT') {
                registrationWhere.attendances = { some: { isPresent: true } }
            } else if (attendanceStatus === 'ABSENT') {
                // "Absent" now means "Not Present" (either explicitly marked false or not marked at all)
                registrationWhere.NOT = {
                    attendances: {
                        some: { isPresent: true }
                    }
                }
            }
        }

        if (registrationWhere) {
            where.registrations = { some: registrationWhere }
        } else if (hasRegistrations) {
            where.registrations = { some: {} }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { fullName: 'asc' },
                include: {
                    house: {
                        select: { name: true, color: true }
                    },
                    registrations: {
                        where: volunteerId ? { programId: { in: assignedProgramIds } } : undefined,
                        include: {
                            program: {
                                select: { name: true, type: true, category: true, id: true }
                            },
                            attendances: {
                                select: { isPresent: true }
                            }
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ])

        return { success: true, data: { users, total, page, limit } }
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function getHouses() {
    try {
        const houses = await prisma.house.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        })
        return { success: true, data: houses }
    } catch (error) {
        console.error('Failed to fetch houses:', error)
        return { success: false, error: 'Failed to fetch houses' }
    }
}

export async function getVolunteers() {
    try {
        const volunteers = await prisma.user.findMany({
            where: { role: 'VOLUNTEER' },
            orderBy: { fullName: 'asc' },
            select: { id: true, fullName: true, email: true }
        })
        return { success: true, data: volunteers }
    } catch (error) {
        console.error('Failed to fetch volunteers:', error)
        return { success: false, error: 'Failed to fetch volunteers' }
    }
}

export async function updateUserRole(userId: string, role: 'STUDENT' | 'VOLUNTEER' | 'ADMIN' | 'MASTER') {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        })
        return { success: true }
    } catch (error) {
        console.error('Failed to update user role:', error)
        return { success: false, error: 'Failed to update user role' }
    }
}
