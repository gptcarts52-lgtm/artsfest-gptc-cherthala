import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { createRegistrationSchema } from '@/utils/validation'
import type { ApiResponse } from '@/types'

async function getHandler(
    request: NextRequest,
    context: { user: { userId: string; role: string } }
) {
    try {
        const registrations = await prisma.registration.findMany({
            where: {
                userId: context.user.userId,
                status: { not: 'CANCELLED' },
            },
            include: {
                program: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        category: true,
                        description: true,
                    },
                },
                groupMembers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                studentAdmnNo: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: registrations,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Get registrations error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to fetch registrations',
            },
            { status: 500 }
        )
    }
}

async function postHandler(
    request: NextRequest,
    context: { user: { userId: string; role: string } }
) {
    try {
        const body = await request.json()

        // Validate request
        const validation = createRegistrationSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: validation.error.errors[0].message,
                },
                { status: 400 }
            )
        }

        const { programId, isGroup, groupName, groupMemberIds } = validation.data

        // Get program details
        const program = await prisma.program.findUnique({
            where: { id: programId },
        })

        if (!program || !program.isActive) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Program not found or inactive',
                },
                { status: 404 }
            )
        }

        // Validate program type matches registration type
        if (program.type === 'SOLO' && isGroup) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Cannot register as group for solo program',
                },
                { status: 400 }
            )
        }

        if (program.type === 'GROUP' && !isGroup) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Must register as group for group program',
                },
                { status: 400 }
            )
        }

        // Check if user already registered for this program
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                programId,
                userId: context.user.userId,
                status: { not: 'CANCELLED' },
            },
        })

        if (existingRegistration) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Already registered for this program',
                },
                { status: 409 }
            )
        }

        // Get user and configuration
        const user = await prisma.user.findUnique({
            where: { id: context.user.userId },
            select: { houseId: true },
        })

        if (!user || !user.houseId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'User house not assigned',
                },
                { status: 400 }
            )
        }

        // Get configuration limits
        const [maxSoloConfig, maxGroupConfig] = await Promise.all([
            prisma.configuration.findUnique({ where: { key: 'maxSoloPrograms' } }),
            prisma.configuration.findUnique({ where: { key: 'maxGroupPrograms' } }),
        ])

        const maxSolo = maxSoloConfig ? parseInt(maxSoloConfig.value) : 3
        const maxGroup = maxGroupConfig ? parseInt(maxGroupConfig.value) : 2

        // Check registration limits
        const userRegistrations = await prisma.registration.groupBy({
            by: ['isGroup'],
            where: {
                userId: context.user.userId,
                status: { not: 'CANCELLED' },
            },
            _count: true,
        })

        const soloCount = userRegistrations.find((r) => !r.isGroup)?._count || 0
        const groupCount = userRegistrations.find((r) => r.isGroup)?._count || 0

        if (!isGroup && soloCount >= maxSolo) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: `Maximum solo program limit reached (${maxSolo})`,
                },
                { status: 400 }
            )
        }

        if (isGroup && groupCount >= maxGroup) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: `Maximum group program limit reached (${maxGroup})`,
                },
                { status: 400 }
            )
        }

        // Validate group members if group registration
        if (isGroup && groupMemberIds) {
            const memberCount = groupMemberIds.length + 1 // +1 for the leader

            if (memberCount < program.minMembers) {
                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: `Minimum ${program.minMembers} members required`,
                    },
                    { status: 400 }
                )
            }

            if (memberCount > program.maxMembers) {
                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: `Maximum ${program.maxMembers} members allowed`,
                    },
                    { status: 400 }
                )
            }

            // Verify all members exist
            const members = await prisma.user.findMany({
                where: {
                    id: { in: groupMemberIds },
                    role: 'STUDENT',
                },
            })

            if (members.length !== groupMemberIds.length) {
                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: 'One or more group members not found',
                    },
                    { status: 400 }
                )
            }
        }

        // Create registration
        const registration = await prisma.registration.create({
            data: {
                programId,
                userId: context.user.userId,
                houseId: user.houseId,
                isGroup,
                groupName: isGroup ? groupName : null,
                category: program.category,
                status: 'CONFIRMED',
                groupMembers: isGroup && groupMemberIds
                    ? {
                        create: groupMemberIds.map((memberId) => ({
                            userId: memberId,
                        })),
                    }
                    : undefined,
            },
            include: {
                program: true,
                groupMembers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                studentAdmnNo: true,
                            },
                        },
                    },
                },
            },
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: registration,
                message: 'Successfully registered for program',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Create registration error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to create registration',
            },
            { status: 500 }
        )
    }
}

export const GET = withAuth(getHandler, { roles: ['STUDENT', 'VOLUNTEER', 'ADMIN', 'MASTER'] as any })
export const POST = withAuth(postHandler, { roles: ['STUDENT'] as any })
