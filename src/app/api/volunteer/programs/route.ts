import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import type { ApiResponse } from '@/types'

async function handler(request: NextRequest, context: { user: { userId: string; role: string } }) {
    try {
        const programs = await prisma.program.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        registrations: {
                            where: {
                                status: { not: 'CANCELLED' },
                            },
                        },
                    },
                },
            },
            orderBy: [{ category: 'asc' }, { type: 'asc' }, { name: 'asc' }],
        })

        const programsWithStats = programs.map((program) => ({
            id: program.id,
            name: program.name,
            description: program.description,
            type: program.type,
            category: program.category,
            minMembers: program.minMembers,
            maxMembers: program.maxMembers,
            participantCount: program._count.registrations,
        }))

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: programsWithStats,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Get volunteer programs error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to fetch programs',
            },
            { status: 500 }
        )
    }
}

export const GET = withAuth(handler, { roles: ['VOLUNTEER', 'ADMIN'] as any })
