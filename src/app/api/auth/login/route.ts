import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/utils/validation'
import type { ApiResponse, AuthResponse } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate request body
        const validation = loginSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: validation.error.errors[0].message,
                },
                { status: 400 }
            )
        }

        const { studentAdmnNo, password } = validation.data

        // Find user by student admission number OR email
        // We treat the 'studentAdmnNo' field from request as a generic identifier
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { studentAdmnNo: { equals: studentAdmnNo, mode: 'insensitive' } },
                    { email: { equals: studentAdmnNo, mode: 'insensitive' } }
                ]
            },
            include: {
                house: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Invalid credentials',
                },
                { status: 401 }
            )
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password)

        if (!isValidPassword) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: 'Invalid credentials',
                },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = generateToken(user.id, user.role)

        const response: AuthResponse = {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                studentAdmnNo: user.studentAdmnNo,
                role: user.role,
                gender: user.gender,
                department: user.department || undefined,
                semester: user.semester || undefined,
                house: user.house
                    ? {
                        id: user.house.id,
                        name: user.house.name,
                        color: user.house.color || undefined,
                    }
                    : undefined,
            },
            token,
        }

        return NextResponse.json<ApiResponse<AuthResponse>>(
            {
                success: true,
                data: response,
                message: `Welcome back, ${user.fullName}!`,
            },
            { status: 200 }
        )
    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to login',
            },
            { status: 500 }
        )
    }
}
