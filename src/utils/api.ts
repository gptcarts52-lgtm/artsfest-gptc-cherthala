// API client utilities for frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface RequestOptions extends RequestInit {
    token?: string
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { token, ...fetchOptions } = options

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as any),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
    }

    return data
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
}

/**
 * Set token in localStorage
 */
export function setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
}

/**
 * Remove token from localStorage
 */
export function removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getToken()
}

// Auth API calls
export const authApi = {
    register: (data: any) => apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    login: (data: any) => apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getCurrentUser: () => apiRequest('/api/auth/me', {
        token: getToken() || undefined,
    }),
}

// Programs API calls
export const programsApi = {
    getAll: (params?: { type?: string; category?: string }) => {
        const query = new URLSearchParams(params as any).toString()
        return apiRequest(`/api/programs${query ? `?${query}` : ''}`, {
            token: getToken() || undefined,
        })
    },
}

// Registrations API calls
export const registrationsApi = {
    getMyRegistrations: () => apiRequest('/api/registrations', {
        token: getToken() || undefined,
    }),

    create: (data: any) => apiRequest('/api/registrations', {
        method: 'POST',
        body: JSON.stringify(data),
        token: getToken() || undefined,
    }),

    delete: (id: string) => apiRequest(`/api/registrations/${id}`, {
        method: 'DELETE',
        token: getToken() || undefined,
    }),
}

// Volunteer API calls
export const volunteerApi = {
    getPrograms: () => apiRequest('/api/volunteer/programs', {
        token: getToken() || undefined,
    }),

    getParticipants: (programId: string) =>
        apiRequest(`/api/volunteer/participants?programId=${programId}`, {
            token: getToken() || undefined,
        }),

    markAttendance: (data: any) => apiRequest('/api/volunteer/attendance', {
        method: 'POST',
        body: JSON.stringify(data),
        token: getToken() || undefined,
    }),
}

// Admin API calls
export const adminApi = {
    // Programs
    getPrograms: () => apiRequest('/api/admin/programs', {
        token: getToken() || undefined,
    }),

    createProgram: (data: any) => apiRequest('/api/admin/programs', {
        method: 'POST',
        body: JSON.stringify(data),
        token: getToken() || undefined,
    }),

    updateProgram: (id: string, data: any) => apiRequest(`/api/admin/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token: getToken() || undefined,
    }),

    deleteProgram: (id: string) => apiRequest(`/api/admin/programs/${id}`, {
        method: 'DELETE',
        token: getToken() || undefined,
    }),

    // Reports
    getHouseReport: (houseId?: string, format: 'json' | 'csv' = 'json') => {
        const params = new URLSearchParams()
        if (houseId) params.append('houseId', houseId)
        params.append('format', format)
        return apiRequest(`/api/admin/reports/house?${params.toString()}`, {
            token: getToken() || undefined,
        })
    },
}
