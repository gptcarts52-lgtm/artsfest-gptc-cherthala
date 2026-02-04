'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, Inter } from 'next/font/google'
import styles from './programs.module.css'
import { getPrograms, registerForProgram } from '@/actions/programs'
import { AuthResponse } from '@/types'
import { Program } from '@prisma/client'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function ProgramsPage() {
    const router = useRouter()
    const [user, setUser] = useState<AuthResponse['user'] | null>(null)
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'ALL' | 'ON_STAGE' | 'OFF_STAGE'>('ALL')

    // Modal state
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
    const [teamName, setTeamName] = useState('')
    const [registering, setRegistering] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    useEffect(() => {
        // Load user
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) {
            router.push('/login')
            return
        }

        try {
            setUser(JSON.parse(userStr))
        } catch (e) {
            console.error('Failed to parse user', e)
        }

        // Load programs
        loadPrograms()
    }, [router])

    async function loadPrograms() {
        setLoading(true)
        try {
            const res = await getPrograms()
            if (res.success && res.data) {
                setPrograms(res.data)
            }
        } catch (e) {
            console.error('Failed to load programs', e)
        } finally {
            setLoading(false)
        }
    }

    const filteredPrograms = programs.filter(p => {
        if (filter === 'ALL') return true
        return p.category === filter
    })

    const handleRegisterClick = (program: Program) => {
        setSelectedProgram(program)
        setTeamName('')
        setMessage(null)
    }

    const handleConfirmRegistration = async () => {
        if (!user || !selectedProgram) return

        if (selectedProgram.type === 'GROUP' && !teamName.trim()) {
            setMessage({ type: 'error', text: 'Please enter a team name for group events.' })
            return
        }

        setRegistering(true)
        setMessage(null)

        try {
            const res = await registerForProgram(
                user.id,
                selectedProgram.id,
                selectedProgram.type === 'GROUP',
                teamName
            )

            if (res.success) {
                setMessage({ type: 'success', text: 'Successfully registered!' })
                setTimeout(() => {
                    setSelectedProgram(null)
                    router.refresh() // Refresh to update dashboard data if cached
                }, 1500)
            } else {
                setMessage({ type: 'error', text: res.error || 'Registration failed' })
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setRegistering(false)
        }
    }

    if (loading) {
        return (
            <div className={`${styles.container} ${inter.className}`}>
                <p>Loading programs...</p>
            </div>
        )
    }

    return (
        <div className={`${styles.container} ${inter.className}`}>
            <header className={styles.header}>
                <div>
                    <h1 className={`${styles.title} ${cinzel.className}`}>Browse Programs</h1>
                    <button
                        onClick={() => router.push('/dashboard')}
                        style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--foreground)' }}
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterButton} ${filter === 'ALL' ? styles.active : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'ON_STAGE' ? styles.active : ''}`}
                        onClick={() => setFilter('ON_STAGE')}
                    >
                        On Stage
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'OFF_STAGE' ? styles.active : ''}`}
                        onClick={() => setFilter('OFF_STAGE')}
                    >
                        Off Stage
                    </button>
                </div>
            </header>

            <div className={styles.grid}>
                {filteredPrograms.map(program => (
                    <div key={program.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={`${styles.programName} ${cinzel.className}`}>{program.name}</h3>
                            <span className={styles.programType}>{program.type}</span>
                        </div>
                        <p className={styles.description}>{program.description || 'No description available.'}</p>
                        <div className={styles.meta}>
                            <span>Min: {program.minMembers} | Max: {program.maxMembers}</span>
                            <span>{program.category.replace('_', ' ')}</span>
                        </div>
                        <button
                            className={styles.registerButton}
                            onClick={() => handleRegisterClick(program)}
                        >
                            Register
                        </button>
                    </div>
                ))}
            </div>

            {/* Registration Modal */}
            {selectedProgram && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={`${styles.modalTitle} ${cinzel.className}`}>
                            Register for {selectedProgram.name}
                        </h2>

                        {message && (
                            <p className={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                                {message.text}
                            </p>
                        )}

                        {selectedProgram.type === 'GROUP' && (
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Team Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Enter your team name"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                                    Note: You need between {selectedProgram.minMembers} and {selectedProgram.maxMembers} members.
                                </p>
                            </div>
                        )}

                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Are you sure you want to register for this <b>{selectedProgram.category.replace('_', ' ').toLowerCase()}</b> event?
                            This will count towards your registration limits.
                        </p>

                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setSelectedProgram(null)}
                                disabled={registering}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleConfirmRegistration}
                                disabled={registering}
                            >
                                {registering ? 'Registering...' : 'Confirm Registration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
