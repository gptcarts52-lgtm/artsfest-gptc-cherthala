'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AppConfig {
    festivalName: string
    festivalYear: string
    galleryImages: string[]
    galleryText: string
    notifications: any[]
    artsFestManual: string
    contactInfo: any
    departments: {
        code: string
        name: string
    }[]
}

interface ConfigContextType {
    config: AppConfig
    loading: boolean
    refreshConfig: () => Promise<void>
}

const defaultConfig: AppConfig = {
    festivalName: 'ArtsFest GPTC',
    festivalYear: new Date().getFullYear().toString(),
    galleryImages: [],
    galleryText: '',
    notifications: [],
    artsFestManual: '',
    contactInfo: null,
    departments: []
}

const ConfigContext = createContext<ConfigContextType>({
    config: defaultConfig,
    loading: true,
    refreshConfig: async () => { }
})

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AppConfig>(defaultConfig)
    const [loading, setLoading] = useState(true)

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/config')
            const data = await res.json()
            if (data.success) {
                const d = data.data

                // Parse JSON fields safely
                let galleryImages: string[] = []
                try {
                    galleryImages = JSON.parse(d.galleryImages || '[]')
                    if (!Array.isArray(galleryImages)) galleryImages = []
                } catch (e) { }

                let notifications: any[] = []
                try {
                    notifications = JSON.parse(d.notifications || '[]')
                    if (!Array.isArray(notifications)) notifications = []
                } catch (e) { }

                let departments = []
                try {
                    departments = JSON.parse(d.departments || '[]')
                } catch (e) { }

                let contactInfo = null
                try {
                    contactInfo = JSON.parse(d.contactInfo || '{}')
                } catch (e) { }

                setConfig({
                    festivalName: d.festivalName || defaultConfig.festivalName,
                    festivalYear: d.festivalYear || defaultConfig.festivalYear,
                    galleryImages,
                    galleryText: d.galleryText || '',
                    notifications,
                    artsFestManual: d.artsFestManual || '',
                    contactInfo,
                    departments
                })
            }
        } catch (error) {
            console.error('Failed to fetch config', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConfig()
    }, [])

    return (
        <ConfigContext.Provider value={{ config, loading, refreshConfig: fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    )
}

export const useConfig = () => useContext(ConfigContext)

