import type { Metadata } from 'next'
import { getCategories, getHeaderMenu } from '@/lib/db'
import PublicFooter from '@/app/components/public/PublicFooter'
import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: 'সার্চ — Journal',
  description: 'সুহানুর রহমানের জার্নালে লেখা খুঁজুন।',
  alternates: { canonical: 'https://blog.suhanurrahman.com/search/' },
}

export default async function SearchPage() {
  const [categories, menu] = await Promise.all([getCategories(), getHeaderMenu()])
  return (
    <div className="site-public">
      <SearchPageClient categories={categories} menu={menu} />
    </div>
  )
}
