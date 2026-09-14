import type { Metadata } from 'next'
import { getCategories, getHeaderMenu } from '@/lib/db'
import SearchPageClient from './SearchPageClient'
import PublicFooter from '@/app/components/public/PublicFooter'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সার্চ — সোহানুর রহমান | Notes',
  description: 'সোহানুর রহমানের Notes-এ প্রযুক্তি, এআই, গবেষণা, ডেটা ও ডিজিটাল সংস্কৃতি নিয়ে লেখা খুঁজুন।',
  keywords: ['সার্চ', 'সোহানুর রহমান', 'Notes', 'প্রযুক্তি', 'এআই', 'গবেষণা'],
  alternates: { canonical: `${SITE}/search/` },
  robots: { index: false, follow: true },
}

export default async function SearchPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  let menu: Awaited<ReturnType<typeof getHeaderMenu>> = []

  try {
    ;[categories, menu] = await Promise.all([getCategories(), getHeaderMenu()])
  } catch {
    // Keep the search UI available even if navigation data is unavailable.
  }

  return (
    <div className="site-public">
      <SearchPageClient categories={categories} menu={menu} />
      <PublicFooter categories={categories} />
    </div>
  )
}
