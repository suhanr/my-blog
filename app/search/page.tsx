import type { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'
import { SITE } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'সার্চ — সোহানুর রহমান | Notes',
  description: 'সোহানুর রহমানের Notes-এ প্রযুক্তি, এআই, গবেষণা, ডেটা ও ডিজিটাল সংস্কৃতি নিয়ে লেখা খুঁজুন।',
  keywords: ['সার্চ', 'সোহানুর রহমান', 'Notes', 'প্রযুক্তি', 'এআই', 'গবেষণা'],
  alternates: { canonical: `${SITE}/search/` },
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return (
    <div className="site-public">
      <SearchPageClient categories={[]} menu={[]} />
    </div>
  )
}
