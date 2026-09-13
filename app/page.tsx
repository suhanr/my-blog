import Link from 'next/link'
import { countPublishedPosts, getCategories, listPublishedPosts } from '@/lib/db'
import { catColor, formatDate, shortText } from '@/lib/publicUi'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import PostGrid, { type Card } from '@/app/components/public/PostGrid'
import { RevealInit } from '@/app/components/public/enhancers'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [posts, categories, total] = await Promise.all([listPublishedPosts(12), getCategories(), countPublishedPosts()])
  const featured = posts[0]
  const side = posts.slice(1, 3)
  const gridPosts = posts.slice(3) as unknown as Card[]
  const hasMore = total > posts.length

  return (
    <div className="site-public">
      <PublicHeader categories={categories} />

      <main className="mag-main">
        <div className="mag-container">
          {featured ? (
            <section className="mag-section" style={{ paddingTop: 26 }}>
              <div className="mag-hero">
                <article className="mag-hero-lead reveal" style={{ ['--cat' as string]: catColor(featured.categoryName) }}>
                  <Link href={`/${featured.slug}/`} className="mag-hero-media">
                    {featured.coverImage ? <img src={featured.coverImage} alt={featured.title} /> : null}
                  </Link>
                  <span className="mag-chip">{featured.categoryName || 'বিশেষ প্রতিবেদন'}</span>
                  <h1 className="mag-hero-title"><Link href={`/${featured.slug}/`}>{featured.title}</Link></h1>
                  <p className="mag-hero-dek">{shortText(featured.excerpt, 220)}</p>
                  <div className="mag-meta">{formatDate(featured.publishedAt)} · সোহানুর রহমান</div>
                </article>
                <div className="mag-hero-side">
                  {side.map((post) => (
                    <article key={post.id} className="reveal" style={{ ['--cat' as string]: catColor(post.categoryName) }}>
                      <span className="mag-chip">{post.categoryName || 'সাম্প্রতিক'}</span>
                      <h3><Link href={`/${post.slug}/`}>{post.title}</Link></h3>
                      <div className="mag-meta">{formatDate(post.publishedAt)}</div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="mag-section"><p className="mag-hero-dek">এখনো কোনো লেখা প্রকাশিত হয়নি।</p></section>
          )}

          {gridPosts.length ? (
            <section className="mag-section">
              <div className="mag-section-head">
                <h2 className="mag-section-title">সাম্প্রতিক লেখা <span className="en">Latest</span></h2>
                <Link className="mag-all" href="/">সব লেখা <span className="arrow">→</span></Link>
              </div>
              <PostGrid initialPosts={gridPosts} offsetStart={3} hasMore={hasMore} />
            </section>
          ) : null}

          <section className="mag-section" style={{ borderBottom: 'none' }}>
            <div className="mag-cta reveal">
              <h2>নতুন লেখা মিস করতে চান না?</h2>
              <p>প্রযুক্তি, গবেষণা ও অনুসন্ধানের সেরা লেখাগুলো সরাসরি আপনার ইনবক্সে পেতে যোগাযোগ করুন।</p>
              <a className="mag-btn" href="mailto:suhanurrahman.r@gmail.com">যোগাযোগ করুন →</a>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
