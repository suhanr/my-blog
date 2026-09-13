import type { Metadata } from 'next'
import { getCategories, getHeaderMenu } from '@/lib/db'
import SearchPageClient from './SearchPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সার্চ — Journal',
  description: 'সুহানুর রহমানের জার্নালে লেখা খুঁজুন।',
  alternates: { canonical: 'https://blog.suhanurrahman.com/search/' },
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = '' }, categories, menu] = await Promise.all([searchParams, getCategories(), getHeaderMenu()])
  return (
    <div className="site-public">
      <SearchPageClient categories={categories} menu={menu} initialQuery={q} />
    </div>
  )
}
