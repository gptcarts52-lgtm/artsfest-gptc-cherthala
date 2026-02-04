import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticate } from '@/lib/middleware'
import type { ApiResponse, ProgramWithStats } from '@/types'

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const category = searchParams.get('category')

        // Build filter
        const where: any = {
            isActive: true,
        }

        if (type && (type === 'SOLO' || type === 'GROUP')) {
            where.type = type
        }

        if (category && (category === 'ON_STAGE' || category === 'OFF_STAGE')) {
            where.category = category
        }

        // Get authentication if available (optional for browsing)
        const authResult = await authenticate(request)
        const userId = authResult.authenticated ? authResult.user?.userId : null

        // Fetch programs with registration counts
        const programs = await prisma.program.findMany({
            where,
            include: {
                _count: {
                    select: {
                        registrations: true,
                    },
                },
                registrations: userId
                    ? {
                        where: {
                            userId,
                            status: { not: 'CANCELLED' },
                        },
                        select: {
                            id: true,
                        },
                    }
                    : false,
            },
            orderBy: [{ category: 'asc' }, { type: 'asc' }, { name: 'asc' }],
        })

        const programsWithStats: ProgramWithStats[] = programs.map((program) => ({
            id: program.id,
            name: program.name,
            description: program.description || undefined,
            type: program.type,
            category: program.category,
            minMembers: program.minMembers,
            maxMembers: program.maxMembers,
            isActive: program.isActive,
            registrationCount: program._count.registrations,
            userRegistered: userId ? (program.registrations as any[]).length > 0 : undefined,
        }))

        return NextResponse.json<ApiResponse<ProgramWithStats[]>>(
            {
                success: true,
                data: programsWithStats,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Get programs error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to fetch programs',
            },
            { status: 500 }
        )
    }
}
