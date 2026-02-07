'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, Inter } from 'next/font/google'
import styles from './programs.module.css'
import { getPrograms, registerForProgram } from '@/actions/programs'
import { getHouseMembers, searchTeamMembers } from '@/actions/users'
import { AuthResponse } from '@/types'
import { Program } from '@prisma/client'

type SearchUser = {
    id: string
    fullName: string
    studentAdmnNo: string
    department: String | null
}

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

    // Group members state
    const [availableMembers, setAvailableMembers] = useState<SearchUser[]>([])
    const [filteredMembers, setFilteredMembers] = useState<SearchUser[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
    const [isLoadingMembers, setIsLoadingMembers] = useState(false)

    useEffect(() => {
        // Load user
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr)
                if (userData.role === 'ADMIN' || userData.role === 'MASTER') {
                    router.push('/dashboard')
                    return
                }
                setUser(userData)
            } catch (e) {
                console.error('Failed to parse user', e)
            }
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

    const handleRegisterClick = async (program: Program) => {
        if (!user) {
            router.push('/login')
            return
        }
        setSelectedProgram(program)
        setTeamName('')
        setSearchQuery('')
        setSelectedMemberIds(new Set())
        setMessage(null)

        if (program.type === 'GROUP' && user.house?.id) {
            setIsLoadingMembers(true)
            try {
                const res = await getHouseMembers(user.house.id, user.id)
                if (res.success && res.data) {
                    setAvailableMembers(res.data as SearchUser[])
                    setFilteredMembers(res.data as SearchUser[])
                }
            } catch (error) {
                console.error('Failed to load house members', error)
            } finally {
                setIsLoadingMembers(false)
            }
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase()
        setSearchQuery(query)

        if (!query) {
            setFilteredMembers(availableMembers)
        } else {
            const filtered = availableMembers.filter(member =>
                member.fullName.toLowerCase().includes(query) ||
                member.studentAdmnNo.toLowerCase().includes(query)
            )
            setFilteredMembers(filtered)
        }
    }

    const toggleMember = (memberId: string) => {
        const newSelected = new Set(selectedMemberIds)
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId)
        } else {
            newSelected.add(memberId)
        }
        setSelectedMemberIds(newSelected)
    }

    const handleConfirmRegistration = async () => {
        if (!user || !selectedProgram) return

        if (selectedProgram.type === 'GROUP') {
            if (!teamName.trim()) {
                setMessage({ type: 'error', text: 'Please enter a team name for group events.' })
                return
            }

            // Validate member count
            // Total team size = Leader (current user) + selected members
            const teamSize = 1 + selectedMemberIds.size

            if (teamSize < selectedProgram.minMembers) {
                setMessage({ type: 'error', text: `You need at least ${selectedProgram.minMembers} members (including yourself).` })
                return
            }

            if (teamSize > selectedProgram.maxMembers) {
                setMessage({ type: 'error', text: `Maximum ${selectedProgram.maxMembers} members allowed.` })
                return
            }
        }

        setRegistering(true)
        setMessage(null)

        try {
            const res = await registerForProgram(
                user.id,
                selectedProgram.id,
                selectedProgram.type === 'GROUP',
                teamName,
                Array.from(selectedMemberIds)
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
                    {user && (
                        <button
                            onClick={() => router.push('/dashboard')}
                            style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--foreground)' }}
                        >
                            &larr; Back to Dashboard
                        </button>
                    )}
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
                            <span>{(program.minMembers === 0 && program.maxMembers === 0) ? 'No limit' : `Min: ${program.minMembers} | Max: ${program.maxMembers}`}</span>
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
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Team Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Enter your team name"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Select Team Members ({selectedMemberIds.size} selected)</label>

                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Filter by name..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        style={{ marginBottom: '1rem' }}
                                    />

                                    {isLoadingMembers ? (
                                        <div style={{ textAlign: 'center', padding: '1rem' }}>Loading members...</div>
                                    ) : (
                                        <div className={styles.membersList}>
                                            {filteredMembers.length > 0 ? (
                                                filteredMembers.map(member => (
                                                    <div key={member.id} className={styles.memberCheckboxItem}>
                                                        <label className={styles.checkboxLabel}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMemberIds.has(member.id)}
                                                                onChange={() => toggleMember(member.id)}
                                                                className={styles.checkbox}
                                                            />
                                                            <div className={styles.memberInfo}>
                                                                <span className={styles.memberName}>{member.fullName}</span>
                                                                <span className={styles.memberDetails}>{member.studentAdmnNo} - {member.department}</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.7 }}>
                                                    {availableMembers.length === 0 ? 'No other members found in your house.' : 'No matching members found.'}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                                        Requirement: {(selectedProgram.minMembers === 0 && selectedProgram.maxMembers === 0) ? 'No limit' : `${selectedProgram.minMembers} - ${selectedProgram.maxMembers} members.`}
                                    </p>
                                </div>

                            </>
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
                </div >
            )
            }
        </div >
    )
}
