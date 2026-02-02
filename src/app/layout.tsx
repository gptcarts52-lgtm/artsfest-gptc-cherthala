import type { Metadata } from 'next'
import './globals.css'
import CustomThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'ArtsFest GPTC Cherthala',
  description: 'Arts Festival for GPTC Cherthala',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CustomThemeProvider>
          {children}
        </CustomThemeProvider>
      </body>
    </html>
  )
}