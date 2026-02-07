import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

// NOTE: Local filesystem uploads will NOT work on Vercel as it is read-only.
// In production, consider using Supabase Storage or AWS S3.

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)

        return NextResponse.json({ success: true, url: `/uploads/${filename}` })
    } catch (error) {
        console.error('Upload failed:', error)
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
    }
}
