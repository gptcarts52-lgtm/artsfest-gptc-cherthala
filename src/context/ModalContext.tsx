'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import styles from '@/components/ui/Modals.module.css'
import { Cinzel } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'] })

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ConfirmOptions {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
}

interface ModalContextType {
    showToast: (message: string, type?: ToastType) => void
    confirm: (options: ConfirmOptions) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    const confirm = useCallback((options: ConfirmOptions) => {
        setConfirmOptions(options)
        setIsConfirmOpen(true)
    }, [])

    const handleConfirm = () => {
        if (confirmOptions) {
            confirmOptions.onConfirm()
            setIsConfirmOpen(false)
            setTimeout(() => setConfirmOptions(null), 300)
        }
    }

    const handleCancel = () => {
        if (confirmOptions?.onCancel) {
            confirmOptions.onCancel()
        }
        setIsConfirmOpen(false)
        setTimeout(() => setConfirmOptions(null), 300)
    }

    return (
        <ModalContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* Toast Container */}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`${styles.toast} ${styles.toastActive} ${styles[`toast_${toast.type}`]}`}>
                        <div className={styles.toastContent}>{toast.message}</div>
                    </div>
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmOptions && (
                <div className={`${styles.modalOverlay} ${isConfirmOpen ? styles.modalOverlayActive : ''} ${isConfirmOpen ? styles.modalActive : ''}`}>
                    <div className={styles.confirmModal}>
                        <h2 className={`${styles.modalTitle} ${cinzel.className}`}>{confirmOptions.title}</h2>
                        <div className={styles.modalMessage}>{confirmOptions.message}</div>
                        <div className={styles.modalActions}>
                            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={handleCancel}>
                                {confirmOptions.cancelText || 'Cancel'}
                            </button>
                            <button className={`${styles.btn} ${styles.btnConfirm}`} onClick={handleConfirm}>
                                {confirmOptions.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    )
}

export const useModals = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error('useModals must be used within a ModalProvider')
    }
    return context
}
