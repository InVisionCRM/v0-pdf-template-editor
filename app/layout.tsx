import './globals.css'
import { Inter } from "next/font/google"
import { ClientProviders } from '@/components/client-providers'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'In-Vision Contracts',
  description: 'Contract management system for In-Vision Construction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
