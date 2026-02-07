import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractToken } from './auth'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string
        role: string
    }
}

/**
 * Middleware to authenticate requests
 * Verifies JWT token and attaches user info to request
 */
export async function authenticate(request: NextRequest): Promise<{
    authenticated: boolean
    user?: { userId: string; role: string }
    error?: string
}> {
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)

    if (!token) {
        return {
            authenticated: false,
            error: 'No authentication token provided',
        }
    }

    const payload = verifyToken(token)

    if (!payload) {
        return {
            authenticated: false,
            error: 'Invalid or expired token',
        }
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true },
    })

    if (!user) {
        return {
            authenticated: false,
            error: 'User not found',
        }
    }

    return {
        authenticated: true,
        user: {
            userId: user.id,
            role: user.role,
        },
    }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, allowedRoles: Role[]): boolean {
    return allowedRoles.includes(userRole as Role)
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth(
    handler: (request: NextRequest, context: any) => Promise<NextResponse>,
    options?: {
        roles?: Role[]
    }
) {
    return async (request: NextRequest, context: any) => {
        const authResult = await authenticate(request)

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { success: false, error: authResult.error || 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check role if specified
        if (options?.roles && !hasRole(authResult.user.role, options.roles)) {
            return NextResponse.json(
                { success: false, error: 'Insufficient permissions' },
                { status: 403 }
            )
        }

        return handler(request, { ...context, user: authResult.user })
    }
}
