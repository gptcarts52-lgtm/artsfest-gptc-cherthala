
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function markAttendance(
    userId: string,
    registrationId: string,
    programId: string,
    markedById: string,
    isPresent: boolean
) {
    try {
        // Check if attendance record allows multiple or single per registration?
        // Schema says @@unique([registrationId, userId])

        if (isPresent) {
            await prisma.$transaction([
                prisma.attendance.upsert({
                    where: { registrationId_userId: { registrationId, userId } },
                    create: { registrationId, userId, programId, markedBy: markedById, isPresent: true },
                    update: { isPresent: true, markedBy: markedById, markedAt: new Date() }
                }),
                prisma.registration.update({
                    where: { id: registrationId },
                    data: {
                        score: 2,
                        grade: 'PARTICIPATION'
                    }
                })
            ])
        } else {
            // If marking as NOT present, maybe delete the record? Or set isPresent = false?
            // Schema has isPresent Boolean @default(false).
            // Usually attendance is a record of presence. If absent, maybe no record? 
            // Or record with isPresent = false.
            // Let's upsert with false.

            await prisma.$transaction([
                prisma.attendance.upsert({
                    where: { registrationId_userId: { registrationId, userId } },
                    create: { registrationId, userId, programId, markedBy: markedById, isPresent: false },
                    update: { isPresent: false, markedBy: markedById, markedAt: new Date() }
                }),
                prisma.registration.update({
                    where: { id: registrationId },
                    data: {
                        score: 0,
                        grade: null
                    }
                })
            ])

            // Alternatively, delete? But keeping it as false is record of checking.
            // Let's stick to upsert isPresent.
        }

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to mark attendance:', error)
        return { success: false, error: 'Failed to mark attendance' }
    }
}
