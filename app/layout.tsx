// app/layout.tsx
import type { Metadata } from 'next'
import '../styles/dashboard.css'
import { IBM_Plex_Mono } from 'next/font/google'

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Amanda Photography — Studio',
  description: 'Professional photography platform. Upload, manage, and deliver studio-grade images.',
  openGraph: {
    title: 'Amanda Photography — Studio',
    description: 'Professional photography platform.',
    url: 'https://amandaland.vercel.app',
    siteName: 'Amanda Photography',
    images: [{ url: 'https://res.cloudinary.com/dz0zxxd7d/image/upload/c_fill,w_1200,h_630,q_auto,f_auto/amandaland/Lifestyle/fall-banner' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>{children}</body>
    </html>
  )
}
