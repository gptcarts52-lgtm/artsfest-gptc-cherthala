import nodemailer from 'nodemailer'

export async function sendEmail({ to, subject, text, html, attachments, smtpConfig }: {
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: any[],
    smtpConfig?: {
        host: string,
        port: number,
        user: string,
        pass: string,
        secure: boolean
    }
}) {
    // Priority: dynamic config > environment variables
    const user = smtpConfig?.user || process.env.SMTP_USER
    const pass = smtpConfig?.pass || process.env.SMTP_PASS
    const host = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = smtpConfig?.port || parseInt(process.env.SMTP_PORT || '587')
    const secure = smtpConfig?.secure ?? (process.env.SMTP_SECURE === 'true')

    if (!user || !pass) {
        console.warn('SMTP credentials not found. Email not sent.')
        return { success: false, error: 'SMTP credentials not configured. Please check database settings or .env file.' }
    }

    try {
        const dynamicTransporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        })

        await dynamicTransporter.sendMail({
            from: `"ArtsFest GPTC" <${user}>`,
            to,
            subject,
            text,
            html,
            attachments
        })
        return { success: true }
    } catch (error) {
        console.error('Email send failed:', error)
        return { success: false, error: String(error) }
    }
}
