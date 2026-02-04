'use server'

import { prisma } from '@/lib/prisma'

export interface DashboardData {
    registrations: any[]
    limits: {
        maxOnStageSolo: number
        maxOnStageGroup: number
        maxOffStageTotal: number
    }
    counts: {
        onStageSolo: number
        onStageGroup: number
        offStageTotal: number
    }
}

export async function getDashboardData(userId: string): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
    try {
        const [registrations, configs] = await Promise.all([
            prisma.registration.findMany({
                where: { userId },
                include: {
                    program: true,
                    groupMembers: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    studentAdmnNo: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.configuration.findMany({
                where: {
                    key: {
                        in: ['maxOnStageSolo', 'maxOnStageGroup', 'maxOffStageTotal']
                    }
                }
            })
        ])

        const limits = {
            maxOnStageSolo: 0,
            maxOnStageGroup: 0,
            maxOffStageTotal: 0
        }

        configs.forEach(config => {
            if (config.key === 'maxOnStageSolo') limits.maxOnStageSolo = parseInt(config.value)
            if (config.key === 'maxOnStageGroup') limits.maxOnStageGroup = parseInt(config.value)
            if (config.key === 'maxOffStageTotal') limits.maxOffStageTotal = parseInt(config.value)
        })

        // Calculate counts
        let onStageSolo = 0
        let onStageGroup = 0
        let offStageTotal = 0

        registrations.forEach(reg => {
            if (reg.status === 'CANCELLED') return

            if (reg.program.category === 'ON_STAGE') {
                if (reg.program.type === 'SOLO') {
                    onStageSolo++
                } else if (reg.program.type === 'GROUP') {
                    onStageGroup++
                }
            } else if (reg.program.category === 'OFF_STAGE') {
                offStageTotal++
            }
        })

        return {
            success: true,
            data: {
                registrations,
                limits,
                counts: {
                    onStageSolo,
                    onStageGroup,
                    offStageTotal
                }
            }
        }

    } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        return { success: false, error: 'Failed to load dashboard data' }
    }
}
