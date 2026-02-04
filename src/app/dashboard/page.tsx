'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, Inter } from 'next/font/google'
import styles from './dashboard.module.css'
import { AuthResponse } from '@/types'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

import { getDashboardData, DashboardData } from '@/actions/dashboard'

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<AuthResponse['user'] | null>(null)
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for token and user in localStorage
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
            router.push('/login')
            return
        }

        try {
            const userData = JSON.parse(userStr)
            setUser(userData)

            // Fetch dashboard data
            getDashboardData(userData.id).then(res => {
                if (res.success && res.data) {
                    setDashboardData(res.data)
                }
            }).finally(() => {
                setLoading(false)
            })

        } catch (e) {
            console.error('Failed to parse user data', e)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/login')
            setLoading(false)
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        router.push('/login')
    }

    if (loading) {
        return (
            <div className={`${styles.container} ${inter.className}`}>
                <p>Loading...</p>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className={`${styles.container} ${inter.className}`}>
            <header className={styles.header}>
                <div>
                    <h1 className={`${styles.title} ${cinzel.className}`}>Dashboard</h1>
                    <p className={styles.label}>Welcome, <span className={styles.userName}>{user.fullName}</span></p>
                </div>
                <div className={styles.userInfo}>
                    <button
                        onClick={() => router.push('/programs')}
                        className={styles.logoutButton}
                        style={{ marginRight: '1rem', borderColor: 'var(--foreground)', color: 'var(--foreground)' }}
                    >
                        Browse Programs
                    </button>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Sign Out
                    </button>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Profile Card */}
                <div className={styles.card}>
                    <h2 className={`${styles.cardTitle} ${cinzel.className}`}>Profile Details</h2>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Admission No</span>
                        <span className={styles.value}>{user.studentAdmnNo}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>{user.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Department</span>
                        <span className={styles.value}>{user.department || '-'}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Semester</span>
                        <span className={styles.value}>{user.semester || '-'}</span>
                    </div>
                    {user.house && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>House</span>
                            <span className={styles.value} style={{ color: user.house.color }}>
                                {user.house.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Registration Limits Card */}
                {dashboardData && (
                    <div className={styles.card}>
                        <h2 className={`${styles.cardTitle} ${cinzel.className}`}>Registration Status</h2>

                        <div className={styles.paramsList}>
                            <div className={styles.paramItem}>
                                <div className={styles.paramHeader}>
                                    <span className={styles.label}>On Stage (Solo)</span>
                                    <span className={styles.value}>{dashboardData.counts.onStageSolo} / {dashboardData.limits.maxOnStageSolo}</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min((dashboardData.counts.onStageSolo / dashboardData.limits.maxOnStageSolo) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className={styles.paramItem}>
                                <div className={styles.paramHeader}>
                                    <span className={styles.label}>On Stage (Group)</span>
                                    <span className={styles.value}>{dashboardData.counts.onStageGroup} / {dashboardData.limits.maxOnStageGroup}</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min((dashboardData.counts.onStageGroup / dashboardData.limits.maxOnStageGroup) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className={styles.paramItem}>
                                <div className={styles.paramHeader}>
                                    <span className={styles.label}>Off Stage (Total)</span>
                                    <span className={styles.value}>{dashboardData.counts.offStageTotal} / {dashboardData.limits.maxOffStageTotal}</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min((dashboardData.counts.offStageTotal / dashboardData.limits.maxOffStageTotal) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Registered Programs List */}
                {dashboardData && (
                    <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
                        <h2 className={`${styles.cardTitle} ${cinzel.className}`}>My Registrations</h2>
                        {dashboardData.registrations.length > 0 ? (
                            <div className={styles.registrationsList}>
                                {dashboardData.registrations.map(reg => (
                                    <div key={reg.id} className={styles.regItem}>
                                        <div className={styles.regHeader}>
                                            <span className={styles.programName}>{reg.program.name}</span>
                                            <span className={`${styles.statusBadge} ${styles[reg.status.toLowerCase()]}`}>
                                                {reg.status}
                                            </span>
                                        </div>
                                        <div className={styles.regMeta}>
                                            <span>{reg.program.category.replace('_', ' ')}</span>
                                            <span>•</span>
                                            <span>{reg.program.type}</span>
                                            {reg.isGroup && reg.groupName && (
                                                <>
                                                    <span>•</span>
                                                    <span>Team: {reg.groupName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.label}>No registrations yet.</p>
                        )}
                    </div>
                )}

                {/* Role specific cards */}
                {user.role === 'ADMIN' && (
                    <div className={styles.card}>
                        <h2 className={`${styles.cardTitle} ${cinzel.className}`}>Admin Controls</h2>
                        <p className={styles.label}>Access admin functionality via the sidebar.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
