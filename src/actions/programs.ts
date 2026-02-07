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
            orderBy: { name: 'asc' },
            include: { volunteers: true }
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
    groupName?: string,
    groupMemberIds: string[] = []
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

        // 4. Validate Group Members (if provided)
        if (isGroup && groupMemberIds.length > 0) {
            // Check if members exist and are in the same house
            const members = await prisma.user.findMany({
                where: {
                    id: { in: groupMemberIds },
                    houseId: user.houseId
                }
            })

            if (members.length !== groupMemberIds.length) {
                return { success: false, error: 'One or more selected members are invalid or belong to a different house.' }
            }

            // Check if members are already registered for this program
            // This is complex query, simpler to check one by one or trust the uniqueness constraint on GroupMember if existed, 
            // but we need to check their registrations.

            // Check for direct registrations or group memberships
            // For simplicity, we check if they have a registration for this program ID
            const memberRegistrations = await prisma.registration.findMany({
                where: {
                    userId: { in: groupMemberIds },
                    programId: programId,
                    status: { not: 'CANCELLED' }
                }
            })

            if (memberRegistrations.length > 0) {
                return { success: false, error: 'One or more members are already registered for this program.' }
            }

            // Also check if they are part of another group for this program (via GroupMember table)
            const memberGrouporships = await prisma.groupMember.findMany({
                where: {
                    userId: { in: groupMemberIds },
                    registration: {
                        programId: programId,
                        status: { not: 'CANCELLED' }
                    }
                }
            })

            if (memberGrouporships.length > 0) {
                return { success: false, error: 'One or more members are already part of another team for this program.' }
            }
        }


        // 5. Check system limits
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

        // 6. Check if user has a house (Required for registration)
        if (!user.houseId) {
            return { success: false, error: 'You must be assigned to a house to register.' }
        }

        // 7. Create Registration with Transaction
        await prisma.$transaction(async (tx) => {
            // Create main registration
            const registration = await tx.registration.create({
                data: {
                    userId,
                    programId,
                    houseId: user.houseId!,
                    category: program.category,
                    isGroup,
                    groupName: isGroup ? groupName : null,
                    status: 'PENDING' // Or CONFIRMED depending on workflow. Assuming PENDING until verified? Or CONFIRMED by default. Schema says default CONFIRMED? No default is CONFIRMED in schema.
                }
            })

            // Add self as group member (Optional but good for consistency) 
            // Actually, schema usually links other members. The leader is linked via userId on Registration.
            // Let's add ONLY additional members to GroupMember table to avoid unique constraint issues if userId is unique in GroupMember for a reg.
            // Schema: GroupMember { registrationId, userId } unique.

            // Add other members
            if (groupMemberIds.length > 0) {
                await tx.groupMember.createMany({
                    data: groupMemberIds.map(mid => ({
                        registrationId: registration.id,
                        userId: mid
                    }))
                })
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
