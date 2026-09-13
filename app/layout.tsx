import type { Metadata } from 'next'
import './ckeditor-admin.css'
import './theme.css'

const SITE = 'https://blog.suhanurrahman.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Suhanur Rahman — Journal', template: '%s | Suhanur Rahman' },
  description: 'Personal journal by Suhanur Rahman covering technology, AI, research, digital investigations, data and ideas.',
  alternates: { canonical: SITE },
  authors: [{ name: 'Suhanur Rahman', url: 'https://suhanurrahman.com/' }],
  robots: { index: true, follow: true },
  openGraph: { type: 'website', siteName: 'Suhanur Rahman — Journal', url: SITE, title: 'Suhanur Rahman — Journal', description: 'Technology, research, digital investigations, data and ideas.' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
