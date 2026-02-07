import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { assignHouse } from '@/lib/houseAssignment'
import { registerSchema } from '@/utils/validation'
import type { ApiResponse, AuthResponse } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate request body
        const validation = registerSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: validation.error.errors[0].message,
                },
                { status: 400 }
            )
        }

        const { fullName, email, password, studentAdmnNo, phone, gender, department, semester } =
            validation.data

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { studentAdmnNo }],
            },
        })

        if (existingUser) {
            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error:
                        existingUser.email === email
                            ? 'Email already registered'
                            : 'Student admission number already registered',
                },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Assign house
        const houseId = await assignHouse(gender as any, department, semester)

        // Create user
        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                studentAdmnNo,
                phone,
                gender: gender as any,
                department,
                semester,
                houseId,
                role: 'STUDENT',
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
                message: `Welcome ${user.fullName}! You have been assigned to ${user.house?.name}.`,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Registration error:', error)
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: error.message || 'Failed to register user',
            },
            { status: 500 }
        )
    }
}
