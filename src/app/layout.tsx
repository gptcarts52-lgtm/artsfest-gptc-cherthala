import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import ContactFloat from '@/components/ContactFloat'
import './globals.css'
import { ConfigProvider } from '@/context/ConfigContext'
import { ModalProvider } from '@/context/ModalContext'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <ConfigProvider>
          <ModalProvider>
            <Navbar />
            {children}
            <ContactFloat />
          </ModalProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}