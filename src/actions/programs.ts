'use server'

import { prisma } from '@/lib/prisma'
import { Program, ProgramCategory, ProgramType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getPrograms(filters?: { category?: ProgramCategory }) {
    try {
        const where: any = {}
        if (filters?.category) {
            where.category = filters.category
        }

        const programs = await prisma.program.findMany({
            where,
            orderBy: { name: 'asc' }
        })

        return { success: true, data: programs }
    } catch (error) {
        console.error('Failed to fetch programs:', error)
        return { success: false, error: 'Failed to fetch programs' }
    }
}

export async function registerForProgram(
    userId: string,
    programId: string,
    isGroup: boolean,
    groupName?: string
) {
    try {
        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { registrations: { include: { program: true } } }
        })

        if (!user) return { success: false, error: 'User not found' }

        // 2. Check if already registered
        const existingReg = user.registrations.find(r => r.programId === programId && r.status !== 'CANCELLED')
        if (existingReg) return { success: false, error: 'Already registered for this program' }

        // 3. Get program details
        const program = await prisma.program.findUnique({ where: { id: programId } })
        if (!program) return { success: false, error: 'Program not found' }

        // 4. Check system limits
        const configs = await prisma.configuration.findMany({
            where: {
                key: { in: ['maxOnStageSolo', 'maxOnStageGroup', 'maxOffStageTotal'] }
            }
        })

        const limits = {
            maxOnStageSolo: 0,
            maxOnStageGroup: 0,
            maxOffStageTotal: 0
        }

        configs.forEach(c => {
            if (c.key === 'maxOnStageSolo') limits.maxOnStageSolo = parseInt(c.value)
            if (c.key === 'maxOnStageGroup') limits.maxOnStageGroup = parseInt(c.value)
            if (c.key === 'maxOffStageTotal') limits.maxOffStageTotal = parseInt(c.value)
        })

        // Count current registrations
        let onStageSolo = 0
        let onStageGroup = 0
        let offStageTotal = 0

        user.registrations.forEach(r => {
            if (r.status === 'CANCELLED') return
            if (r.program.category === 'ON_STAGE') {
                if (r.program.type === 'SOLO') onStageSolo++
                if (r.program.type === 'GROUP') onStageGroup++
            } else {
                offStageTotal++
            }
        })

        // Validate against limits
        if (program.category === 'ON_STAGE') {
            if (program.type === 'SOLO') {
                if (onStageSolo >= limits.maxOnStageSolo) {
                    return { success: false, error: `Limit reached for On Stage Solo items (Max: ${limits.maxOnStageSolo})` }
                }
            } else {
                // GROUP
                if (onStageGroup >= limits.maxOnStageGroup) {
                    return { success: false, error: `Limit reached for On Stage Group items (Max: ${limits.maxOnStageGroup})` }
                }
            }
        } else {
            // OFF_STAGE
            if (offStageTotal >= limits.maxOffStageTotal) {
                return { success: false, error: `Limit reached for Off Stage items (Max: ${limits.maxOffStageTotal})` }
            }
        }

        // 5. Check if user has a house (Required for registration)
        if (!user.houseId) {
            return { success: false, error: 'You must be assigned to a house to register.' }
        }

        // 6. Create Registration
        await prisma.registration.create({
            data: {
                userId,
                programId,
                houseId: user.houseId,
                category: program.category,
                isGroup,
                groupName: isGroup ? groupName : null,
                status: 'PENDING'
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/programs')

        return { success: true }

    } catch (error) {
        console.error('Registration failed:', error)
        return { success: false, error: 'Registration failed. Please try again.' }
    }
}
