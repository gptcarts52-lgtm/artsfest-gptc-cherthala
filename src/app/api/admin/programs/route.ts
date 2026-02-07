import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { createProgramSchema, updateProgramSchema } from '@/utils/validation'
import type { ApiResponse } from '@/types'

async function getHandler(
    request: NextRequest,
    context: { user: { userId: string; role: string } }
) {
    try {
        const programs = await prisma.program.findMany({
            include: {
                _count: {
                    select: {
                        registrations: true,
                    },
                },
            },
            orderBy: [{ createdAt: 'desc' }],
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: programs,
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

async function postHandler(
    request: NextRequest,
    context: { user: { userId: string; role: string } }
) {
    try {
        const body = await request.json()

        // Validate request
        const validation = createProgramSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: validation.error.errors[0].message,
                },
                { status: 400 }
            )
        }

        const program = await prisma.program.create({
            data: validation.data as any,
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: program,
                message: 'Program created successfully',
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Create program error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to create program',
            },
            { status: 500 }
        )
    }
}

export const GET = withAuth(getHandler, { roles: ['ADMIN', 'MASTER'] as any })
export const POST = withAuth(postHandler, { roles: ['ADMIN', 'MASTER'] as any })
