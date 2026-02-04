import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/middleware'
import { markAttendanceSchema } from '@/utils/validation'
import type { ApiResponse } from '@/types'

async function handler(request: NextRequest, context: { user: { userId: string; role: string } }) {
    try {
        const body = await request.json()

        // Validate request
        const validation = markAttendanceSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: validation.error.errors[0].message,
                },
                { status: 400 }
            )
        }

        const { programId, attendances } = validation.data

        // Verify program exists
        const program = await prisma.program.findUnique({
            where: { id: programId },
        })

        if (!program) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Program not found',
                },
                { status: 404 }
            )
        }

        // Bulk upsert attendance records
        const attendanceRecords = await Promise.all(
            attendances.map(async (attendance) => {
                return prisma.attendance.upsert({
                    where: {
                        registrationId_userId: {
                            registrationId: attendance.registrationId,
                            userId: attendance.userId,
                        },
                    },
                    update: {
                        isPresent: attendance.isPresent,
                        markedBy: context.user.userId,
                        markedAt: new Date(),
                    },
                    create: {
                        registrationId: attendance.registrationId,
                        userId: attendance.userId,
                        programId,
                        isPresent: attendance.isPresent,
                        markedBy: context.user.userId,
                    },
                })
            })
        )

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: attendanceRecords,
                message: `Successfully marked attendance for ${attendanceRecords.length} participants`,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Mark attendance error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to mark attendance',
            },
            { status: 500 }
        )
    }
}

export const POST = withAuth(handler, { roles: ['VOLUNTEER', 'ADMIN'] as any })
