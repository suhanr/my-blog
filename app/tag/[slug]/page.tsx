import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getHeaderMenu, getTagBySlug } from '@/lib/db'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { PostCard, type Card } from '@/app/components/public/PostGrid'
import { RevealInit } from '@/app/components/public/enhancers'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getTagBySlug(slug)
  return data
    ? { title: `#${data.tag.name}`, description: `Articles tagged ${data.tag.name} by Suhanur Rahman.`, alternates: { canonical: `https://blog.suhanurrahman.com/tag/${slug}/` } }
    : { title: 'Tag not found' }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, categories, menu] = await Promise.all([getTagBySlug(slug), getCategories(), getHeaderMenu()])

  return (
    <div className="site-public">
      <PublicHeader categories={categories} menu={menu} />
      <main className="mag-main">
        <div className="mag-container">
          <section className="mag-section">
            <div className="mag-section-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div className="mag-kicker">ট্যাগ</div>
              <h1 className="mag-article-title" style={{ fontSize: 'clamp(30px,4vw,46px)' }}>#{data ? data.tag.name : 'পাওয়া যায়নি'}</h1>
              {data ? <p className="mag-meta">{data.posts.length} টি লেখা</p> : <Link className="mag-all" href="/">← হোমে ফিরুন</Link>}
            </div>
            {data && data.posts.length ? (
              <div className="mag-grid">
                {(data.posts as unknown as Card[]).map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            ) : data ? (
              <p className="mag-hero-dek">এই ট্যাগে এখনো কোনো লেখা নেই।</p>
            ) : null}
          </section>
        </div>
      </main>
      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
