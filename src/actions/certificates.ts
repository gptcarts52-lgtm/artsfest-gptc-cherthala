'use server'

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'
import { jsPDF } from 'jspdf'
import { revalidatePath } from 'next/cache'

export async function generateAndSendCertificates(registrationIds: string[]) {
    try {
        // 1. Fetch Registrations
        const registrations = await prisma.registration.findMany({
            where: {
                id: { in: registrationIds },
                attendances: { some: { isPresent: true } }
            },
            include: {
                user: true,
                program: true,
            }
        })

        if (registrations.length === 0) {
            return { success: false, error: 'No eligible registrations found (students must be present)' }
        }

        // 2. Fetch Configurations
        const configs = await prisma.configuration.findMany({
            where: {
                key: { in: ['certificateTemplate', 'smtpConfig', 'festivalName'] }
            }
        })

        const templateBase64 = configs.find(c => c.key === 'certificateTemplate')?.value || ''
        const smtpStr = configs.find(c => c.key === 'smtpConfig')?.value || '{}'
        const festivalName = configs.find(c => c.key === 'festivalName')?.value || 'ArtsFest GPTC'

        let smtpConfigObj: any = {}
        try {
            smtpConfigObj = JSON.parse(smtpStr)
        } catch (e) { }

        let successCount = 0
        let failCount = 0

        for (const reg of registrations) {
            try {
                // 3. Generate PDF
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                })

                const width = doc.internal.pageSize.getWidth()
                const height = doc.internal.pageSize.getHeight()

                // --- BASE LAYER ---
                if (templateBase64) {
                    try {
                        let imageData: string | Buffer = templateBase64
                        let format = 'JPEG'
                        if (templateBase64.toLowerCase().endsWith('.png')) format = 'PNG'
                        else if (templateBase64.toLowerCase().endsWith('.webp')) format = 'WEBP'

                        if (templateBase64.startsWith('/uploads/')) {
                            const fs = await import('fs/promises')
                            const path = await import('path')
                            const filePath = path.join(process.cwd(), 'public', templateBase64)
                            imageData = await fs.readFile(filePath)
                            if (templateBase64.toLowerCase().endsWith('.png')) format = 'PNG'
                        }
                        doc.addImage(imageData as any, format, 0, 0, width, height)
                    } catch (e) {
                        console.error('Failed to add background image:', e)
                        doc.setDrawColor(180, 150, 50)
                        doc.setLineWidth(1)
                        doc.rect(5, 5, width - 10, height - 10)
                    }
                } else {
                    doc.setDrawColor(180, 150, 50)
                    doc.setLineWidth(1.5)
                    doc.rect(10, 10, width - 20, height - 20)
                    doc.rect(12, 12, width - 24, height - 24)
                }

                // --- TEXT OVERLAY ---
                // Heading - Always show
                doc.setFont('times', 'bold')
                doc.setFontSize(38)
                doc.setTextColor(100, 20, 20)
                doc.text('CERTIFICATE OF MERIT', width / 2, 40, { align: 'center' })

                doc.setTextColor(40, 40, 40)
                doc.setFont('times', 'normal')
                doc.setFontSize(20)
                doc.text('This is to certify that', width / 2, 60, { align: 'center' })

                // Student Name
                doc.setFontSize(32)
                doc.setFont('times', 'bolditalic')
                doc.setTextColor(0, 0, 0)
                doc.text(reg.user.fullName.toUpperCase(), width / 2, 78, { align: 'center' })

                // Achievement Line (Reduced vertical gap)
                doc.setFont('times', 'normal')
                doc.setFontSize(18)
                doc.setTextColor(40, 40, 40)

                const grade = (reg as any).grade
                let achievementText = (grade && grade !== 'PARTICIPATION')
                    ? `has secured ${grade.replace(/_/g, ' ')}`
                    : 'has successfully participated'

                doc.text(`${achievementText} in the event`, width / 2, 92, { align: 'center' })

                // Program Name
                doc.setFont('times', 'bold')
                doc.setFontSize(22)
                doc.setTextColor(150, 30, 30)
                doc.text(`${reg.program.name} (${reg.program.type})`, width / 2, 104, { align: 'center' })

                // Festival Line
                doc.setFont('times', 'italic')
                doc.setFontSize(16)
                doc.setTextColor(60, 60, 60)
                doc.text(`conducted as part of ${festivalName}`, width / 2, 116, { align: 'center' })

                // Date
                doc.setFont('times', 'normal')
                doc.setFontSize(13)
                doc.text(`Dated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, width / 2, 128, { align: 'center' })

                const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

                // 4. Send Email
                const emailRes = await sendEmail({
                    to: reg.user.email,
                    subject: `Certificate for ${reg.program.name} - ${festivalName}`,
                    text: `Hello ${reg.user.fullName},\n\nCongratulations! Please find your certificate for ${reg.program.name} attached.\n\nBest regards,\n${festivalName} Committee`,
                    attachments: [
                        {
                            filename: `Certificate_${reg.user.fullName.replace(/\s+/g, '_')}_${reg.program.name.replace(/\s+/g, '_')}.pdf`,
                            content: pdfBuffer
                        }
                    ],
                    smtpConfig: smtpConfigObj.user ? smtpConfigObj : undefined
                })

                if (emailRes.success) {
                    successCount++
                    // Record certificate generation
                    await prisma.certificate.create({
                        data: {
                            userId: reg.userId,
                            registrationId: reg.id,
                            type: (reg as any).grade && (reg as any).grade !== 'PARTICIPATION' ? 'GRADE' : 'PARTICIPATION',
                            grade: (reg as any).grade,
                            emailSent: true
                        }
                    })
                } else {
                    console.error(`Email failed for ${reg.user.email}:`, emailRes.error)
                    failCount++
                }
            } catch (err) {
                console.error(`Failed to process certificate for ${reg.user.fullName}:`, err)
                failCount++
            }
        }

        revalidatePath('/dashboard')
        return {
            success: true,
            message: `Processed ${registrations.length} certificates. ${successCount} sent, ${failCount} failed.`
        }
    } catch (error) {
        console.error('Certificate generation failed:', error)
        return { success: false, error: 'Main processing failed' }
    }
}
