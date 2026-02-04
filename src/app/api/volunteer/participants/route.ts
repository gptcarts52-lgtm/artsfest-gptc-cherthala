import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import type { ApiResponse } from '@/types'

async function handler(request: NextRequest, context: { user: { userId: string; role: string } }) {
    try {
        const { searchParams } = new URL(request.url)
        const programId = searchParams.get('programId')

        if (!programId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Program ID is required',
                },
                { status: 400 }
            )
        }

        const participants = await prisma.registration.findMany({
            where: {
                programId,
                status: { not: 'CANCELLED' },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        studentAdmnNo: true,
                        email: true,
                        department: true,
                        semester: true,
                    },
                },
                house: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
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
                attendances: {
                    select: {
                        id: true,
                        isPresent: true,
                        markedAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: participants,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Get participants error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to fetch participants',
            },
            { status: 500 }
        )
    }
}

export const GET = withAuth(handler, { roles: ['VOLUNTEER', 'ADMIN'] as any })
