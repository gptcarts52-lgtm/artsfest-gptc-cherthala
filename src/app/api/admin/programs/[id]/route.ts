import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { updateProgramSchema } from '@/utils/validation'
import type { ApiResponse } from '@/types'

async function putHandler(
    request: NextRequest,
    context: { params: { id: string }; user: { userId: string; role: string } }
) {
    try {
        const programId = context.params.id
        const body = await request.json()

        // Validate request
        const validation = updateProgramSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: validation.error.errors[0].message,
                },
                { status: 400 }
            )
        }

        const program = await prisma.program.update({
            where: { id: programId },
            data: validation.data as any,
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: program,
                message: 'Program updated successfully',
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Update program error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to update program',
            },
            { status: 500 }
        )
    }
}

async function deleteHandler(
    request: NextRequest,
    context: { params: { id: string }; user: { userId: string; role: string } }
) {
    try {
        const programId = context.params.id

        await prisma.program.delete({
            where: { id: programId },
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: 'Program deleted successfully',
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Delete program error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to delete program',
            },
            { status: 500 }
        )
    }
}

export const PUT = withAuth(putHandler, { roles: ['ADMIN', 'MASTER'] as any })
export const DELETE = withAuth(deleteHandler, { roles: ['ADMIN', 'MASTER'] as any })
