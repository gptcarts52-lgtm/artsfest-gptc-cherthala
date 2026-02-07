'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { Cinzel, Inter } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: '',
        studentAdmnNo: '',

        email: '',
        phone: '',
        gender: 'MALE',
        department: '',
        semester: '',
        password: '',
        confirmPassword: ''
    })
    const [departments, setDepartments] = useState<{ code: string; name: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [configLoading, setConfigLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config')
                const data = await response.json()
                if (data.success && data.data.departments) {
                    setDepartments(data.data.departments)
                    // Set default department if available
                    if (data.data.departments.length > 0) {
                        setFormData(prev => ({ ...prev, department: data.data.departments[0].code }))
                    }
                }
            } catch (err) {
                console.error('Failed to fetch config:', err)
            } finally {
                setConfigLoading(false)
            }
        }

        fetchConfig()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        if (
            !formData.fullName ||
            !formData.studentAdmnNo ||
            !formData.email ||
            !formData.phone ||
            !formData.department ||
            !formData.semester ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (formData.studentAdmnNo.length < 1) {
            setError('Student Admission Number is required')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    studentAdmnNo: formData.studentAdmnNo,
                    gender: formData.gender,
                    department: formData.department,
                    semester: formData.semester
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Auto login after successful registration
            if (data.data?.token) {
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('user', JSON.stringify(data.data.user))
                document.cookie = `token=${data.data.token}; path=/`
            }

            // Redirect to dashboard
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${styles.container} ${inter.className}`}>
            <div className={styles.authCard}>
                <h1 className={`${styles.title} ${cinzel.className}`}>Create Account</h1>
                <p className={styles.subtitle}>Join the ArtsFest celebration</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="fullName">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className={styles.input}
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="studentAdmnNo">
                            Admission Number
                        </label>
                        <input
                            type="text"
                            id="studentAdmnNo"
                            name="studentAdmnNo"
                            className={styles.input}
                            placeholder="Enter your admission number"
                            value={formData.studentAdmnNo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={styles.input}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="phone">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className={styles.input}
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="gender">
                            Gender
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            className={styles.input}
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="department">
                            Department
                        </label>
                        {configLoading ? (
                            <div className={styles.input} style={{ color: '#999' }}>Loading departments...</div>
                        ) : (
                            <select
                                id="department"
                                name="department"
                                className={styles.input}
                                value={formData.department}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.code} value={dept.code}>
                                        {dept.name} ({dept.code})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="semester">
                            Year
                        </label>
                        <select
                            id="semester"
                            name="semester"
                            className={styles.input}
                            value={formData.semester}
                            onChange={handleChange}
                        >
                            <option value="" disabled>Select Year</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                        </select>
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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className={styles.input}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className={styles.links}>
                    Already have an account?
                    <Link href="/login" className={styles.link}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    )
}
