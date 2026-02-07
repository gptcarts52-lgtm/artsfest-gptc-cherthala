'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Cinzel, Inter } from 'next/font/google'
import styles from './Navbar.module.css'

const cinzel = Cinzel({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

import { useConfig } from '@/context/ConfigContext'

export default function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { config } = useConfig()

    // Auth state //
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationShownRef = useRef(false)

    // Auto-show notifications on home page load
    useEffect(() => {
        if (pathname === '/' && config.notifications.length > 0 && !notificationShownRef.current) {
            setShowNotifications(true)
            notificationShownRef.current = true

            // Auto-hide after 3 seconds
            // Note: We intentionally do NOT clear this timeout on effect cleanup.
            // This ensures the hide action fires even if the component re-renders (e.g. config updates)
            setTimeout(() => {
                setShowNotifications(false)
            }, 3000)
        }
    }, [pathname, config.notifications])

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token')
            const userStr = localStorage.getItem('user')

            setIsLoggedIn(!!token)
            if (userStr) {
                try {
                    const user = JSON.parse(userStr)
                    setUserRole(user.role)
                } catch (e) { /* ignore */ }
            }
            setAuthLoading(false)
        }
        checkLoginStatus()
    }, [pathname])

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false)
        setShowNotifications(false) // Close notifs too
    }, [pathname])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        setIsLoggedIn(false)
        setIsMenuOpen(false)
        router.push('/')
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    // Let's just render. The auth check is fast.
    const isTransparent = pathname === '/' || pathname === '/login' || pathname === '/register'
    const headerClass = isTransparent ? styles.header : `${styles.header} ${styles.solidHeader}`

    return (
        <header className={`${headerClass} ${inter.className}`}>
            <Link href="/" className={`${styles.logo} ${cinzel.className}`}>
                {config.festivalName}
            </Link>

            <div className={styles.mobileControls}>
                {/* Notification Icon Mobile (Left of SignOut in Mobile) */}
                <div className={`${styles.notificationWrapper} ${styles.mobileNotification}`}>
                    <button
                        className={styles.notificationBtn}
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {config.notifications.length > 0 && <span className={styles.notificationBadge} />}
                    </button>

                    {showNotifications && (
                        <div className={styles.notificationDropdown} style={{ right: '-50px', width: '280px' }}>
                            {config.notifications.length > 0 ? (
                                config.notifications.map((note: any, idx: number) => (
                                    <div key={idx} className={styles.notificationItem}>
                                        <div className={styles.notificationTitle}>{note.title}</div>
                                        <div className={styles.notificationMsg}>{note.message}</div>
                                        <div className={styles.notificationDate}>{new Date(note.date).toLocaleDateString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>No new notifications</div>
                            )}

                            {config.artsFestManual && (
                                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                                    <a href={config.artsFestManual} target="_blank" rel="noopener noreferrer" className={styles.manualDownloadBtn}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        <span style={{ textAlign: 'center' }}>Download Manual of {config.festivalName}</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!authLoading && isLoggedIn && (
                    <button
                        onClick={handleLogout}
                        className={styles.mobileLogoutIcon}
                        aria-label="Sign Out"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                )}
                <button
                    className={`${styles.mobileToggle} ${isMenuOpen ? styles.open : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className={styles.hamburgerLine}></span>
                    <span className={styles.hamburgerLine}></span>
                    <span className={styles.hamburgerLine}></span>
                </button>
            </div>

            <nav className={`${styles.nav} ${isMenuOpen ? styles.menuOpen : ''}`}>
                <Link
                    href="/"
                    className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                >
                    Home
                </Link>
                {(userRole !== 'ADMIN' && userRole !== 'MASTER') && (
                    <Link
                        href="/programs"
                        className={`${styles.navLink} ${pathname === '/programs' ? styles.active : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Programs
                    </Link>
                )}

                {/* Notification Icon (Desktop: First Item via CSS order) */}
                <div className={`${styles.notificationWrapper} ${styles.navNotification}`}>
                    <button
                        className={styles.notificationBtn}
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label="Notifications"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        {config.notifications.length > 0 && <span className={styles.notificationBadge} />}
                    </button>

                    {showNotifications && (
                        <div className={styles.notificationDropdown}>
                            {config.notifications.length > 0 ? (
                                config.notifications.map((note: any, idx: number) => (
                                    <div key={idx} className={styles.notificationItem}>
                                        <div className={styles.notificationTitle}>{note.title}</div>
                                        <div className={styles.notificationMsg}>{note.message}</div>
                                        <div className={styles.notificationDate}>{new Date(note.date).toLocaleDateString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyState}>No new notifications</div>
                            )}

                            {config.artsFestManual && (
                                <div style={{ padding: '0 1rem 1rem 1rem' }}>
                                    <a href={config.artsFestManual} target="_blank" rel="noopener noreferrer" className={styles.manualDownloadBtn}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        <span style={{ textAlign: 'center' }}>Download Manual of {config.festivalName}</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!authLoading && (
                    isLoggedIn ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className={styles.logoutButton}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/register"
                                className={`${styles.navLink} ${pathname === '/register' ? styles.active : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Register
                            </Link>
                            <Link
                                href="/login"
                                className={`${styles.navLink} ${pathname === '/login' ? styles.active : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </>
                    )
                )}
            </nav>
        </header>
    )
}
