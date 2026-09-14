import type { Metadata } from 'next'
import Link from 'next/link'
import { countPublishedPosts, getCategories, getHeaderMenu, listPublishedPosts } from '@/lib/db'
import { catColor, formatDate, shortText } from '@/lib/publicUi'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import PostGrid, { type Card } from '@/app/components/public/PostGrid'
import { RevealInit } from '@/app/components/public/enhancers'
import { DEFAULT_DESCRIPTION, GLOBAL_KEYWORDS, OG_IMAGE, SITE, SITE_NAME } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${SITE_NAME} | প্রযুক্তি, এআই, গবেষণা ও ডিজিটাল সংস্কৃতি`,
  description: DEFAULT_DESCRIPTION,
  keywords: GLOBAL_KEYWORDS,
  alternates: { canonical: `${SITE}/` },
  openGraph: {
    type: 'website',
    url: `${SITE}/`,
    title: `${SITE_NAME} | প্রযুক্তি, এআই, গবেষণা ও ডিজিটাল সংস্কৃতি`,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    images: [{ url: OG_IMAGE, width: 1672, height: 941, alt: 'সোহানুর রহমান | Notes' }],
  },
}

export default async function Home() {
  const [posts, categories, total, menu] = await Promise.all([listPublishedPosts(12), getCategories(), countPublishedPosts(), getHeaderMenu()])
  const featured = posts[0]
  const side = posts.slice(1, 6)
  const gridPosts = posts.slice(6) as unknown as Card[]
  const hasMore = total > posts.length

  return (
    <div className="site-public">
      <PublicHeader categories={categories} menu={menu} />
      <style>{`
        @media (max-width: 767px) {
          .site-public .mag-main { padding-top: 0 !important; }
          .site-public .mobile-home-hero { padding-top: 0 !important; }
        }
      `}</style>

      <main className="mag-main">
        <div className="mag-container">
          {featured ? (
            <section className="mag-section mobile-home-hero" style={{ paddingTop: 0 }}>
              <div className="mag-hero">
                <article className="mag-hero-lead reveal is-visible" style={{ ['--cat' as string]: catColor(featured.categoryName) }}>
                  <Link href={`/${featured.slug}/`} className="mag-hero-media">
                    {featured.coverImage ? <img src={featured.coverImage} alt={featured.title} decoding="async" fetchPriority="high" /> : null}
                  </Link>
                  {featured.categoryName && featured.categorySlug ? <Link className="mag-chip" href={`/category/${featured.categorySlug}/`}>{featured.categoryName}</Link> : <span className="mag-chip">বিশেষ প্রতিবেদন</span>}
                  <h1 className="mag-hero-title"><Link href={`/${featured.slug}/`}>{featured.title}</Link></h1>
                  <p className="mag-hero-dek">{shortText(featured.excerpt, 220)}</p>
                  <div className="mag-meta">{formatDate(featured.publishedAt)} · <a href="https://suhanurrahman.com/" target="_blank" rel="noreferrer">সোহানুর রহমান</a></div>
                </article>
                <div className="mag-hero-side">
                  {side.map((post) => (
                    <article key={post.id} className="reveal is-visible" style={{ ['--cat' as string]: catColor(post.categoryName) }}>
                      {post.categoryName && post.categorySlug ? <Link className="mag-chip" href={`/category/${post.categorySlug}/`}>{post.categoryName}</Link> : <span className="mag-chip">সাম্প্রতিক</span>}
                      <h3><Link href={`/${post.slug}/`}>{post.title}</Link></h3>
                      <div className="mag-meta">{formatDate(post.publishedAt)}</div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="mag-section"><h1 className="mag-article-title">{SITE_NAME}</h1><p className="mag-hero-dek">এখনো কোনো লেখা প্রকাশিত হয়নি।</p></section>
          )}

          {gridPosts.length ? (
            <section className="mag-section">
              <div className="mag-section-head">
                <h2 className="mag-section-title">সাম্প্রতিক লেখা</h2>
                <Link className="mag-all" href="/">সব লেখা <span className="arrow">→</span></Link>
              </div>
              <PostGrid initialPosts={gridPosts} offsetStart={6} hasMore={hasMore} />
            </section>
          ) : null}

          <section className="mag-section" style={{ borderBottom: 'none' }}>
            <div className="mag-cta reveal">
              <h2>নতুন লেখা মিস করতে চান না?</h2>
              <p>প্রযুক্তি, গবেষণা ও অনুসন্ধানের সেরা লেখাগুলো সম্পর্কে জানতে যোগাযোগ করুন।</p>
              <Link className="mag-btn" href="https://suhanurrahman.com/contact/" target="_blank" rel="noreferrer">যোগাযোগ করুন →</Link>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
