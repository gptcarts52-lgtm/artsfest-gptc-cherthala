import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}