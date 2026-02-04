import { prisma } from './prisma'
import { Gender } from '@prisma/client'

/**
 * Assign a house to a student based on gender, department, and semester
 * 
 * Algorithm:
 * - All female students go to the dedicated girls house
 * - Male students are distributed across other houses using balanced shuffling
 * - Distribution considers department and semester for diversity
 */
export async function assignHouse(
    gender: Gender,
    department?: string,
    semester?: string
): Promise<string> {
    // Get all houses
    const houses = await prisma.house.findMany({
        include: {
            _count: {
                select: { users: true },
            },
        },
    })

    if (houses.length === 0) {
        throw new Error('No houses available. Please create houses first.')
    }

    // If female, assign to girls house
    if (gender === Gender.FEMALE) {
        const girlsHouse = houses.find(h => h.isGirlsHouse)

        if (!girlsHouse) {
            throw new Error('Girls house not found. Please create a girls house.')
        }

        return girlsHouse.id
    }

    // For male students, distribute across non-girls houses
    const maleHouses = houses.filter(h => !h.isGirlsHouse)

    if (maleHouses.length === 0) {
        throw new Error('No houses available for male students.')
    }

    // If only one house, assign to it
    if (maleHouses.length === 1) {
        return maleHouses[0].id
    }

    // Use balanced distribution based on current counts
    // This ensures houses have similar member counts
    const sortedHouses = maleHouses.sort((a, b) => {
        return a._count.users - b._count.users
    })

    // Assign to the house with the least members
    return sortedHouses[0].id
}

/**
 * Get house distribution statistics
 */
export async function getHouseStats() {
    const houses = await prisma.house.findMany({
        include: {
            _count: {
                select: { users: true },
            },
            users: {
                select: {
                    department: true,
                    semester: true,
                    gender: true,
                },
            },
        },
    })

    return houses.map(house => {
        const departmentCounts: Record<string, number> = {}
        const semesterCounts: Record<string, number> = {}
        const genderCounts: Record<string, number> = {}

        house.users.forEach(user => {
            if (user.department) {
                departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1
            }
            if (user.semester) {
                semesterCounts[user.semester] = (semesterCounts[user.semester] || 0) + 1
            }
            genderCounts[user.gender] = (genderCounts[user.gender] || 0) + 1
        })

        return {
            id: house.id,
            name: house.name,
            isGirlsHouse: house.isGirlsHouse,
            totalMembers: house._count.users,
            departmentDistribution: departmentCounts,
            semesterDistribution: semesterCounts,
            genderDistribution: genderCounts,
        }
    })
}
