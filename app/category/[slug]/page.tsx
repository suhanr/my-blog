import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getCategoryBySlug, getHeaderMenu } from '@/lib/db'
import { catColor } from '@/lib/publicUi'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { PostCard, type Card } from '@/app/components/public/PostGrid'
import { RevealInit } from '@/app/components/public/enhancers'
import { PROFILE_IMAGE, SITE, SITE_NAME, breadcrumbJsonLd } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryBySlug(slug)
  if (!data) return { title: 'বিভাগ পাওয়া যায়নি', robots: { index: false, follow: false } }
  const hasPosts = data.posts.length > 0
  const title = `${data.category.name} — বিভাগ | ${SITE_NAME}`
  const description = `${data.category.name} বিভাগে ${SITE_NAME}-এর লেখা, বিশ্লেষণ ও গাইডগুলো দেখুন।`
  return {
    title,
    description,
    keywords: [data.category.name, 'সোহানুর রহমান', 'প্রযুক্তি', 'গবেষণা', 'এআই'],
    alternates: { canonical: `${SITE}/category/${slug}/` },
    robots: hasPosts ? undefined : { index: false, follow: true },
    openGraph: { type: 'website', url: `${SITE}/category/${slug}/`, title, description, images: [{ url: PROFILE_IMAGE, alt: 'সোহানুর রহমান' }] },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, categories, menu] = await Promise.all([getCategoryBySlug(slug), getCategories(), getHeaderMenu()])
  if (!data) notFound()

  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'হোম', url: '/' },
    { name: data.category.name, url: `/category/${slug}/` },
  ])

  return (
    <div className="site-public" style={{ ['--cat' as string]: catColor(data.category.name) }}>
      <PublicHeader categories={categories} menu={menu} />
      <main className="mag-main">
        <div className="mag-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: data.category.name, url: `${SITE}/category/${slug}/`, isPartOf: { '@id': `${SITE}/#website` } }) }} />
          <section className="mag-section">
            <div className="mag-section-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div className="mag-kicker">বিভাগ</div>
              <h1 className="mag-article-title" style={{ fontSize: 'clamp(30px,4vw,46px)' }}>{data.category.name}</h1>
              <p className="mag-meta">{data.posts.length} টি লেখা</p>
            </div>
            {data.posts.length ? (
              <div className="mag-grid">
                {(data.posts as unknown as Card[]).map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            ) : (
              <p className="mag-hero-dek">এই বিভাগে এখনো কোনো লেখা নেই।</p>
            )}
          </section>
        </div>
      </main>
      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
