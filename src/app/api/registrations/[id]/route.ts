import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import type { ApiResponse } from '@/types'

async function deleteHandler(
    request: NextRequest,
    context: { params: { id: string }; user: { userId: string; role: string } }
) {
    try {
        const registrationId = context.params.id

        // Find registration
        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
        })

        if (!registration) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Registration not found',
                },
                { status: 404 }
            )
        }

        // Check ownership
        if (registration.userId !== context.user.userId) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Not authorized to delete this registration',
                },
                { status: 403 }
            )
        }

        // Delete registration (cascade will delete group members)
        await prisma.registration.delete({
            where: { id: registrationId },
        })

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                message: 'Successfully unregistered from program',
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Delete registration error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to delete registration',
            },
            { status: 500 }
        )
    }
}

export const DELETE = withAuth(deleteHandler, { roles: ['STUDENT'] as any })
