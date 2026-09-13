import type { Metadata } from 'next'
import './ckeditor-admin.css'
import './theme.css'
import './scroll-to-top.css'
import './header-menu.css'
import ScrollToTop from './components/public/ScrollToTop'
import { AUTHOR_NAME, AUTHOR_URL, DEFAULT_DESCRIPTION, GLOBAL_KEYWORDS, PROFILE_IMAGE, SITE, SITE_NAME } from '@/lib/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'সোহানুর রহমান জার্নাল — প্রযুক্তি, এআই, গবেষণা ও ডিজিটাল সংস্কৃতি', template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  keywords: GLOBAL_KEYWORDS,
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  category: 'technology',
  alternates: { canonical: SITE },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: PROFILE_IMAGE,
    shortcut: PROFILE_IMAGE,
    apple: PROFILE_IMAGE,
  },
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: SITE_NAME,
    url: SITE,
    title: 'সোহানুর রহমান জার্নাল — প্রযুক্তি, এআই, গবেষণা ও ডিজিটাল সংস্কৃতি',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: PROFILE_IMAGE, width: 512, height: 512, alt: 'সোহানুর রহমান' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'সোহানুর রহমান জার্নাল',
    description: DEFAULT_DESCRIPTION,
    images: [PROFILE_IMAGE],
  },
}

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}})()`

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: 'bn-BD',
      publisher: { '@id': `${SITE}/#person` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE}/#person`,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      image: PROFILE_IMAGE,
      jobTitle: 'Technology and Research Professional',
      mainEntityOfPage: `${SITE}/about/`,
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn-BD">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700;800;900&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <style dangerouslySetInnerHTML={{ __html: 'html{scroll-behavior:auto!important}' }} />
      </head>
      <body>
        {children}
        <ScrollToTop />
      </body>
    </html>
  )
}
