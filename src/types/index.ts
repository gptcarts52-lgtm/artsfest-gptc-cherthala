// Re-export Prisma types
export type {
  User,
  House,
  Program,
  Registration,
  GroupMember,
  Attendance,
  Certificate,
  Configuration,
  Role,
  Gender,
  ProgramType,
  ProgramCategory,
  RegistrationStatus,
  CertificateType,
} from '@prisma/client'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth types
export interface LoginRequest {
  studentAdmnNo: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  studentAdmnNo: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  department?: string
  semester?: string
}

export interface AuthResponse {
  user: {
    id: string
    fullName: string
    email: string
    studentAdmnNo: string
    role: string
    gender: string
    department?: string
    semester?: string
    house?: {
      id: string
      name: string
      color?: string
    }
  }
  token: string
}

export interface JWTPayload {
  userId: string
  role: string
  iat?: number
  exp?: number
}

// Program types
export interface ProgramWithStats {
  id: string
  name: string
  description?: string
  type: string
  category: string
  minMembers: number
  maxMembers: number
  isActive: boolean
  registrationCount: number
  userRegistered?: boolean
}

// Registration types
export interface CreateRegistrationRequest {
  programId: string
  isGroup: boolean
  groupName?: string
  groupMemberIds?: string[]
}

export interface RegistrationWithDetails {
  id: string
  program: {
    id: string
    name: string
    type: string
    category: string
  }
  isGroup: boolean
  groupName?: string
  groupMembers?: {
    id: string
    user: {
      id: string
      fullName: string
      studentAdmnNo: string
    }
  }[]
  status: string
  createdAt: Date
}

// Attendance types
export interface MarkAttendanceRequest {
  attendances: {
    registrationId: string
    userId: string
    isPresent: boolean
  }[]
  programId: string
}

// Report types
export interface ParticipantReport {
  user: {
    id: string
    fullName: string
    studentAdmnNo: string
    email: string
    department?: string
    semester?: string
  }
  house: {
    name: string
  }
  registrations: {
    program: {
      name: string
      type: string
      category: string
    }
    isGroup: boolean
    groupName?: string
  }[]
  attendanceCount: number
  totalPrograms: number
}

// Grade types
export interface AssignGradeRequest {
  registrationId: string
  userId: string
  grade: string
}