import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MEV Analyzer',
  description: 'Detects sandwich attacks and displays graph',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
