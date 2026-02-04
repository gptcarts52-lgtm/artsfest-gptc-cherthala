import fs from 'fs'
import path from 'path'

interface AppConfig {
    departments: {
        code: string
        name: string
    }[]
}

let configCache: AppConfig | null = null

export function getAppConfig(): AppConfig {
    if (configCache) {
        return configCache
    }

    try {
        const configPath = path.join(process.cwd(), 'src/config/app-config.json')
        const fileContents = fs.readFileSync(configPath, 'utf8')
        configCache = JSON.parse(fileContents)
        return configCache!
    } catch (error) {
        console.error('Failed to load app config:', error)
        // Fallback config
        return {
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
