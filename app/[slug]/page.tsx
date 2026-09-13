import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getComments, getPostBySlug, listPublishedPosts } from '@/lib/db'
import { markdownToHtml } from '@/lib/markdown'
import { catColor, formatDate } from '@/lib/publicUi'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { PostCard, type Card } from '@/app/components/public/PostGrid'
import { Lightbox, ReadingProgress, RevealInit } from '@/app/components/public/enhancers'

const SITE = 'https://blog.suhanurrahman.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getPostBySlug(slug)
  if (!p) return { title: 'Not Found' }
  const title = p.seoTitle || p.title
  const description = p.seoDescription || p.excerpt || `${p.title} by Suhanur Rahman.`
  const canonical = p.canonicalUrl || `${SITE}/${p.slug}/`
  return {
    title,
    description,
    alternates: { canonical },
    robots: p.noindex ? { index: false, follow: false } : undefined,
    keywords: p.seoKeywords || undefined,
    openGraph: { type: 'article', url: canonical, title, description, images: (p.ogImage || p.coverImage) ? [{ url: p.ogImage || p.coverImage! }] : undefined, publishedTime: p.publishedAt || undefined, modifiedTime: p.updatedAt },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPostBySlug(slug)
  const categories = await getCategories()
  if (!p) {
    return (
      <div className="site-public">
        <PublicHeader categories={categories} />
        <main className="mag-main"><div className="mag-container mag-article-head"><h1 className="mag-article-title">লেখাটি পাওয়া যায়নি</h1><p className="mag-article-dek"><Link href="/">← হোমে ফিরুন</Link></p></div></main>
        <PublicFooter categories={categories} />
      </div>
    )
  }

  const [comments, allPosts] = await Promise.all([getComments(p.id), listPublishedPosts(8)])
  const related = allPosts.filter((post) => post.id !== p.id && (post.categoryId === p.categoryId || !p.categoryId)).slice(0, 3) as unknown as Card[]
  const html = p.contentFormat === 'HTML' ? p.content : markdownToHtml(p.content)
  const color = catColor(p.categoryName)
  const shareUrl = `${SITE}/${p.slug}/`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.seoDescription || p.excerpt || undefined,
    datePublished: p.publishedAt || undefined,
    dateModified: p.updatedAt,
    mainEntityOfPage: shareUrl,
    author: { '@type': 'Person', name: 'Suhanur Rahman', url: 'https://suhanurrahman.com/' },
    image: (p.ogImage || p.coverImage) ? [p.ogImage || p.coverImage!] : undefined,
    articleSection: p.categoryName || undefined,
  }

  return (
    <div className="site-public mag-article" style={{ ['--cat' as string]: color }}>
      <ReadingProgress />
      <PublicHeader categories={categories} />

      <main className="mag-main">
        <div className="mag-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          <header className="mag-article-head reveal">
            <div className="mag-kicker">{p.categoryName || 'Journal'}</div>
            <h1 className="mag-article-title">{p.title}</h1>
            {p.excerpt ? <p className="mag-article-dek">{p.excerpt}</p> : null}
            <div className="mag-article-meta">
              <b>সুহানুর রহমান</b>
              <span className="dot" />
              <span>{formatDate(p.publishedAt)}</span>
              {p.updatedAt ? <><span className="dot" /><span>হালনাগাদ {formatDate(p.updatedAt)}</span></> : null}
            </div>
          </header>

          {p.coverImage ? (
            <figure className="mag-article-figure reveal">
              <img className="mag-article-hero" src={p.coverImage} alt={p.title} />
            </figure>
          ) : null}

          <div className="mag-article-body" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="mag-article-foot">
            <span className="mag-meta">এই লেখাটি শেয়ার করুন</span>
            <div className="mag-share">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook">f</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X">X</a>
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${p.title} ${shareUrl}`)}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">W</a>
              <a href={`mailto:?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(shareUrl)}`} aria-label="Share by email">@</a>
            </div>
          </div>

          <section className="mag-comments">
            <h2>মন্তব্য <span className="mag-meta">({comments.length})</span></h2>
            {comments.map((c) => (
              <div className="mag-comment" key={c.id}>
                <strong>{c.name}</strong>
                <p>{c.body}</p>
              </div>
            ))}
            <form className="mag-form" action="/api/comments" method="post">
              <input type="hidden" name="postId" value={p.id} />
              <input name="name" placeholder="আপনার নাম" required />
              <input name="email" type="email" placeholder="ইমেইল (ঐচ্ছিক)" />
              <textarea name="body" placeholder="আপনার মন্তব্য লিখুন…" required />
              <button className="mag-btn primary" type="submit">মন্তব্য পাঠান</button>
              <small>মন্তব্য প্রকাশের আগে মডারেশনের জন্য অপেক্ষা করবে।</small>
            </form>
          </section>

          {related.length ? (
            <section className="mag-related">
              <div className="mag-section-head">
                <h2 className="mag-section-title">আরও লেখা <span className="en">More</span></h2>
                <Link className="mag-all" href="/">সব লেখা <span className="arrow">→</span></Link>
              </div>
              <div className="mag-grid">
                {related.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <PublicFooter categories={categories} />
      <RevealInit />
      <Lightbox />
    </div>
  )
}
