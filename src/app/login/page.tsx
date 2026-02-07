'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { Cinzel, Inter } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        studentAdmnNo: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Basic validation
        if (!formData.studentAdmnNo || !formData.password) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            // Store token and user data
            if (data.data?.token) {
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('user', JSON.stringify(data.data.user))
                // Also set a cookie for middleware compatibility if needed in future
                document.cookie = `token=${data.data.token}; path=/`
            }

            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${styles.container} ${inter.className}`}>
            <div className={styles.authCard}>
                <h1 className={`${styles.title} ${cinzel.className}`}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to continue to ArtsFest</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="studentAdmnNo">
                            Admission Number or Email
                        </label>
                        <input
                            type="text"
                            id="studentAdmnNo"
                            name="studentAdmnNo"
                            className={styles.input}
                            placeholder="Enter your admission number or email"
                            value={formData.studentAdmnNo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={styles.input}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.links}>
                    Don't have an account?
                    <Link href="/register" className={styles.link}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    )
}
