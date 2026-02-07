import { prisma } from '@/lib/prisma'

export interface AppConfig {
    festivalName: string
    festivalYear: string
    galleryImages: string
    galleryText: string
    notifications: string
    artsFestManual: string
    contactInfo: string
    departments: {
        code: string
        name: string
    }[]
}

// Simple in-memory cache to avoid hitting DB on every request if needed
let configCache: AppConfig | null = null
let lastFetchTime = 0
const CACHE_TTL = 60000 // 1 minute

export function invalidateConfigCache() {
    configCache = null
    lastFetchTime = 0
}

export async function getAppConfig(): Promise<AppConfig> {
    const now = Date.now()
    if (configCache && (now - lastFetchTime < CACHE_TTL)) {
        return configCache
    }

    try {
        const configs = await prisma.configuration.findMany({
            where: {
                key: { in: ['festivalName', 'departments', 'festivalYear', 'galleryImages', 'galleryText', 'notifications', 'artsFestManual', 'contactInfo'] }
            }
        })

        const configMap = new Map(configs.map(c => [c.key, c.value]))

        const festivalName = configMap.get('festivalName') || 'ArtsFest GPTC'
        const festivalYear = configMap.get('festivalYear') || new Date().getFullYear().toString()
        const galleryImages = configMap.get('galleryImages') || '[]'
        const galleryText = configMap.get('galleryText') || ''
        const notifications = configMap.get('notifications') || '[]'
        const artsFestManual = configMap.get('artsFestManual') || ''
        const contactInfo = configMap.get('contactInfo') || JSON.stringify({ title: 'Contact Us', email: 'arts@gptccherthala.org', phone: '+91 9876543210', address: 'GPTC Cherthala' })

        let departments: AppConfig['departments'] = []
        const deptJson = configMap.get('departments')
        if (deptJson) {
            try {
                departments = JSON.parse(deptJson)
            } catch (e) {
                console.error('Failed to parse departments config', e)
            }
        }

        // Apply defaults if empty (e.g. first run before seed)
        if (departments.length === 0) {
            departments = [
                { code: 'CHE', name: 'Computer Hardware Engineering' },
                { code: 'CT', name: 'Computer Engineering' },
                { code: 'ME', name: 'Mechanical Engineering' },
                { code: 'IE', name: 'Instrumentation Engineering' },
                { code: 'EC', name: 'Electronics & Communication' },
            ]
        }

        configCache = {
            festivalName,
            festivalYear,
            galleryImages,
            galleryText,
            notifications,
            artsFestManual,
            contactInfo,
            departments
        }
        lastFetchTime = now

        return configCache
    } catch (error) {
        console.error('Failed to fetch app config from DB:', error)
        // Fallback
        return {
            festivalName: 'ArtsFest GPTC',
            festivalYear: new Date().getFullYear().toString(),
            galleryImages: '[]',
            galleryText: '',
            notifications: '[]',
            artsFestManual: '',
            contactInfo: JSON.stringify({ title: 'Contact Us', email: 'arts@gptccherthala.org', phone: '+91 9876543210', address: 'GPTC Cherthala' }),
            departments: [
                { code: 'CHE', name: 'Computer Hardware Engineering' },
                { code: 'CT', name: 'Computer Engineering' },
                { code: 'ME', name: 'Mechanical Engineering' },
                { code: 'IE', name: 'Instrumentation Engineering' },
                { code: 'EC', name: 'Electronics & Communication' },
            ],
        }
    }
}
