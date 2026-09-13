import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getHeaderMenu, getTagBySlug } from '@/lib/db'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { PostCard, type Card } from '@/app/components/public/PostGrid'
import { RevealInit } from '@/app/components/public/enhancers'
import { PROFILE_IMAGE, SITE, breadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getTagBySlug(slug)
  if (!data) return { title: 'ট্যাগ পাওয়া যায়নি', robots: { index: false, follow: false } }
  const hasPosts = data.posts.length > 0
  const title = `#${data.tag.name} — ট্যাগ | সোহানুর রহমান জার্নাল`
  const description = `#${data.tag.name} ট্যাগে সোহানুর রহমান জার্নালের লেখা, বিশ্লেষণ ও গাইডগুলো দেখুন।`
  return {
    title,
    description,
    keywords: [data.tag.name, 'সোহানুর রহমান', 'প্রযুক্তি', 'গবেষণা', 'এআই'],
    alternates: { canonical: `${SITE}/tag/${slug}/` },
    robots: hasPosts ? undefined : { index: false, follow: true },
    openGraph: { type: 'website', url: `${SITE}/tag/${slug}/`, title, description, images: [{ url: PROFILE_IMAGE, alt: 'সোহানুর রহমান' }] },
  }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, categories, menu] = await Promise.all([getTagBySlug(slug), getCategories(), getHeaderMenu()])
  if (!data) notFound()

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'হোম', url: '/' },
    { name: `#${data.tag.name}`, url: `/tag/${slug}/` },
  ])

  return (
    <div className="site-public">
      <PublicHeader categories={categories} menu={menu} />
      <main className="mag-main">
        <div className="mag-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `#${data.tag.name}`, url: `${SITE}/tag/${slug}/`, isPartOf: { '@id': `${SITE}/#website` } }) }} />
          <section className="mag-section">
            <div className="mag-section-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div className="mag-kicker">ট্যাগ</div>
              <h1 className="mag-article-title" style={{ fontSize: 'clamp(30px,4vw,46px)' }}>#{data.tag.name}</h1>
              <p className="mag-meta">{data.posts.length} টি লেখা</p>
            </div>
            {data.posts.length ? (
              <div className="mag-grid">
                {(data.posts as unknown as Card[]).map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            ) : (
              <p className="mag-hero-dek">এই ট্যাগে এখনো কোনো লেখা নেই।</p>
            )}
          </section>
        </div>
      </main>
      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
