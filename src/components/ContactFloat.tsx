'use client'

import React, { useState, useRef, useEffect } from 'react'
import styles from './ContactFloat.module.css'
import { Cinzel, Inter } from 'next/font/google'
import { useConfig } from '@/context/ConfigContext'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function ContactFloat() {
    const { config } = useConfig()
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!config.contactInfo) return null

    const contact = config.contactInfo

    return (
        <div className={`${styles.container} ${inter.className}`} ref={containerRef}>
            {isOpen && (
                <div className={styles.popover}>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close contact info"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <h3 className={`${styles.popoverTitle} ${cinzel.className}`}>
                        {contact.title || 'Contact Us'}
                    </h3>

                    {Object.entries(contact).map(([key, value]) => {
                        if (key === 'title') return null
                        if (!value || typeof value !== 'string') return null

                        const k = key.toLowerCase()
                        let icon = (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        )

                        if (k.includes('email') || k.includes('mail')) {
                            icon = (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            )
                        } else if (k.includes('phone') || k.includes('tel') || k.includes('mobile') || k.includes('contact')) {
                            icon = (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            )
                        } else if (k.includes('address') || k.includes('location') || k.includes('place')) {
                            icon = (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            )
                        }

                        let actionButton = null
                        const cleanPhone = value.replace(/\D/g, '')

                        // Check if it's likely an email
                        if (value.includes('@') && value.includes('.')) {
                            actionButton = (
                                <a href={`mailto:${value}`} className={`${styles.actionBtn} ${styles.emailBtn}`}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    Send Email
                                </a>
                            )
                        }
                        // Check if it's phone (at least 10 digits)
                        else if (cleanPhone.length >= 10) {
                            actionButton = (
                                <a href={`tel:${cleanPhone}`} className={`${styles.actionBtn} ${styles.phoneBtn}`}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    Call Now
                                </a>
                            )
                        }

                        return (
                            <div key={key} className={styles.infoItem}>
                                {icon}
                                <div className={styles.contentWrapper}>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, marginBottom: '2px' }}>
                                        {key}
                                    </span>
                                    <span>{value}</span>
                                    {actionButton}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <button
                className={styles.floatBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Contact Us"
            >
                {isOpen ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </button>
        </div>
    )
}
