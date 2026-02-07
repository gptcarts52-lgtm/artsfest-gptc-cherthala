import { NextResponse } from 'next/server'
import { getAppConfig } from '@/lib/config'
import { ApiResponse } from '@/types'

export async function GET() {
    try {
        const config = await getAppConfig()

        return NextResponse.json<ApiResponse>(
            {
                success: true,
                data: config,
            },
            { status: 200 }
        )
    } catch (error: any) {
        return NextResponse.json<ApiResponse>(
            {
                success: false,
                error: 'Failed to fetch configuration',
            },
            { status: 500 }
        )
    }
}
