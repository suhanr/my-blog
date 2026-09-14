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
  const [posts, categories, total, menu, technologyPostsSource] = await Promise.all([
    listPublishedPosts(12),
    getCategories(),
    countPublishedPosts(),
    getHeaderMenu(),
    listPublishedPosts(100),
  ])
  const featured = posts[0]
  const side = posts.slice(1, 6)
  const gridPosts = posts.slice(6) as unknown as Card[]
  const hasMore = total > posts.length
  const technologyPosts = technologyPostsSource
    .filter((post) => post.categorySlug === 'technology' || post.categoryName === 'প্রযুক্তি কথন' || post.categoryName === 'Technology')
    .slice(0, 6) as unknown as Card[]

  return (
    <div className="site-public">
      <PublicHeader categories={categories} menu={menu} />
      <style>{`
        .site-public .mobile-home-hero { border-bottom: 0; }
        .site-public .home-tech-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 38px; row-gap: 26px; }
        .site-public .home-tech-card { display: grid; grid-template-columns: minmax(0, 1fr) 126px; gap: 20px; align-items: start; min-width: 0; padding: 0; border: 0; }
        .site-public .home-tech-card-title { margin: 0 0 13px; font-family: var(--serif); font-size: clamp(24px, 2vw, 31px); line-height: 1.18; font-weight: 500; letter-spacing: -.025em; color: var(--fg); }
        .site-public .home-tech-card-title a { color: inherit; text-decoration: none; }
        .site-public .home-tech-card-title a:hover { color: var(--accent); }
        .site-public .home-tech-card-excerpt { margin: 0; color: var(--muted); font-size: 15px; line-height: 1.65; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
        .site-public .home-tech-card-meta { margin-top: 18px; color: var(--muted); font-size: 13px; }
        .site-public .home-tech-thumb { width: 126px; height: 94px; object-fit: cover; background: var(--bg-2); display: block; }
        @media (max-width: 1000px) {
          .site-public .home-tech-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 680px) {
          .site-public .home-tech-grid { grid-template-columns: 1fr; row-gap: 24px; }
          .site-public .home-tech-card { grid-template-columns: minmax(0, 1fr) 104px; gap: 14px; }
          .site-public .home-tech-card-title { font-size: 23px; }
          .site-public .home-tech-card-excerpt { font-size: 14px; }
          .site-public .home-tech-thumb { width: 104px; height: 78px; }
        }
        @media (max-width: 420px) {
          .site-public .home-tech-card { grid-template-columns: 1fr; }
          .site-public .home-tech-thumb { order: -1; width: 100%; height: 190px; }
        }
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

          {technologyPosts.length ? (
            <section className="mag-section">
              <div className="mag-section-head">
                <h2 className="mag-section-title">প্রযুক্তি কথন</h2>
                <Link className="mag-all" href="/category/tech-gossip">সকল লেখা <span className="arrow">→</span></Link>
              </div>
              <div className="home-tech-grid">
                {technologyPosts.map((post) => (
                  <article key={post.id} className="home-tech-card reveal is-visible">
                    <div>
                      <h3 className="home-tech-card-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h3>
                      {post.excerpt ? <p className="home-tech-card-excerpt">{shortText(post.excerpt, 180)}</p> : null}
                      <div className="home-tech-card-meta">সোহানুর রহমান</div>
                    </div>
                    <Link href={`/${post.slug}/`} aria-label={post.title}>
                      {post.coverImage ? <img className="home-tech-thumb" src={post.coverImage} alt="" loading="lazy" decoding="async" /> : <span className="home-tech-thumb" aria-hidden="true" />}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

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
