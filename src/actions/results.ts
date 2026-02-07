'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const SCORE_MAP: Record<string, number> = {
    'WINNER': 5,
    'FIRST_RUNNER_UP': 4,
    'SECOND_RUNNER_UP': 3,
    'PARTICIPATION': 2
}

export async function updateRegistrationResult(registrationId: string, grade: string | null) {
    try {
        const score = grade ? (SCORE_MAP[grade] || 0) : 0

        await prisma.registration.update({
            where: { id: registrationId },
            data: {
                grade,
                score
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to update result:', error)
        return { success: false, error: 'Failed to update result' }
    }
}

export async function getHouseLeaderboard() {
    try {
        const houses = await prisma.house.findMany({
            include: {
                registrations: {
                    select: {
                        score: true
                    }
                }
            }
        })

        const stats = houses.map(house => {
            const totalScore = house.registrations.reduce((sum, reg) => sum + reg.score, 0)
            return {
                id: house.id,
                name: house.name,
                color: house.color,
                score: totalScore
            }
        }).sort((a, b) => b.score - a.score)

        return { success: true, data: stats }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        return { success: false, error: 'Failed to fetch leaderboard' }
    }
}
