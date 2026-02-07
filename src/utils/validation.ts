import { z } from 'zod'

// Auth validation schemas
export const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    studentAdmnNo: z.string().min(1, 'Student admission number is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
        message: 'Gender must be MALE, FEMALE, or OTHER',
    }),
    department: z.string().optional(),
    semester: z.string().optional(),
})

export const loginSchema = z.object({
    studentAdmnNo: z.string().min(1, 'Student admission number is required'),
    password: z.string().min(1, 'Password is required'),
})

// Program validation schemas
export const createProgramSchema = z.object({
    name: z.string().min(1, 'Program name is required'),
    description: z.string().optional(),
    type: z.enum(['SOLO', 'GROUP']),
    category: z.enum(['ON_STAGE', 'OFF_STAGE']),
    minMembers: z.number().int().min(1),
    maxMembers: z.number().int().min(1),
    isActive: z.boolean().default(true),
})

export const updateProgramSchema = createProgramSchema.partial()

// Registration validation schemas
export const createRegistrationSchema = z.object({
    programId: z.string().min(1, 'Program ID is required'),
    isGroup: z.boolean(),
    groupName: z.string().optional(),
    groupMemberIds: z.array(z.string()).optional(),
}).refine(
    (data) => {
        if (data.isGroup && (!data.groupMemberIds || data.groupMemberIds.length === 0)) {
            return false
        }
        return true
    },
    {
        message: 'Group registrations must include at least one member',
        path: ['groupMemberIds'],
    }
)

// Attendance validation schemas
export const markAttendanceSchema = z.object({
    programId: z.string().min(1, 'Program ID is required'),
    attendances: z.array(
        z.object({
            registrationId: z.string(),
            userId: z.string(),
            isPresent: z.boolean(),
        })
    ).min(1, 'At least one attendance record is required'),
})

// Grade validation schemas
export const assignGradeSchema = z.object({
    registrationId: z.string().min(1, 'Registration ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    grade: z.string().min(1, 'Grade is required'),
})

// Configuration validation schemas
export const updateConfigSchema = z.object({
    maxSoloPrograms: z.number().int().min(1).optional(),
    maxGroupPrograms: z.number().int().min(1).optional(),
    minAttendanceForCertificate: z.number().int().min(0).optional(),
})

// House validation schemas
export const createHouseSchema = z.object({
    name: z.string().min(1, 'House name is required'),
    color: z.string().optional(),
    description: z.string().optional(),
    isGirlsHouse: z.boolean().default(false),
})
