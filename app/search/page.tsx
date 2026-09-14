import type { Metadata } from 'next'
import { getCategories, getHeaderMenu } from '@/lib/db'
import SearchPageClient from './SearchPageClient'
import { SITE } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সার্চ — সোহানুর রহমান | Notes',
  description: 'সোহানুর রহমানের Notes-এ প্রযুক্তি, এআই, গবেষণা, ডেটা ও ডিজিটাল সংস্কৃতি নিয়ে লেখা খুঁজুন।',
  keywords: ['সার্চ', 'সোহানুর রহমান', 'Notes', 'প্রযুক্তি', 'এআই', 'গবেষণা'],
  alternates: { canonical: `${SITE}/search/` },
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = '' }, categories, menu] = await Promise.all([searchParams, getCategories(), getHeaderMenu()])
  return (
    <div className="site-public">
      <SearchPageClient categories={categories} menu={menu} initialQuery={q} />
    </div>
  )
}
