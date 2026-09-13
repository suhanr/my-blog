import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getComments, getPostBySlug, listPublishedPosts } from '@/lib/db'
import { markdownToHtml } from '@/lib/markdown'

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

function formatDate(v: string | null) {
  return v ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(v)) : ''
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPostBySlug(slug)
  if (!p) return <main className="site-public"><div className="public-container article-top"><h1 className="article-title">Article not found</h1><Link href="/">Back to journal</Link></div></main>

  const [comments, allPosts, categories] = await Promise.all([getComments(p.id), listPublishedPosts(8), getCategories()])
  const nav = categories.slice(0, 7)
  const related = allPosts.filter((post) => post.id !== p.id && (post.categoryId === p.categoryId || !p.categoryId)).slice(0, 3)
  const html = p.contentFormat === 'HTML' ? p.content : markdownToHtml(p.content)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.seoDescription || p.excerpt || undefined,
    datePublished: p.publishedAt || undefined,
    dateModified: p.updatedAt,
    mainEntityOfPage: `${SITE}/${p.slug}/`,
    author: { '@type': 'Person', name: 'Suhanur Rahman', url: 'https://suhanurrahman.com/' },
    image: (p.ogImage || p.coverImage) ? [p.ogImage || p.coverImage!] : undefined,
    articleSection: p.categoryName || undefined,
  }

  return (
    <div className="site-public article-page">
      <div className="public-topline"><div className="public-container public-topline-inner"><span>Journalism in the public interest.</span><Link href="/">জনস্বার্থে সাংবাদিকতা</Link></div></div>
      <header className="public-header">
        <div className="public-container public-header-main">
          <div className="public-menu"><span className="public-icon" aria-hidden="true">☰</span><Link href="/">Journal</Link></div>
          <Link href="/" className="public-wordmark">SUHANUR RAHMAN<span>জার্নাল</span></Link>
          <div className="public-actions"><a href="https://suhanurrahman.com/">Portfolio ↗</a><span className="public-icon" aria-hidden="true">⌕</span></div>
        </div>
        <div className="public-navrow"><nav className="public-container public-navrow-inner" aria-label="Journal sections">{nav.map((category) => <Link key={category.id} href={`/category/${category.slug}/`}>{category.name}</Link>)}<Link href="/">All stories</Link></nav></div>
      </header>

      <main className="public-main">
        <div className="public-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <header className="article-top">
            <div className="article-kicker">{p.categoryName || 'Journal'}</div>
            <h1 className="article-title">{p.title}</h1>
            {p.excerpt ? <p className="article-dek">{p.excerpt}</p> : null}
            <div className="article-meta-row"><div className="article-byline">By Suhanur Rahman</div><div className="article-date">{formatDate(p.publishedAt)} · Updated {formatDate(p.updatedAt)}</div></div>
          </header>

          {p.coverImage ? <img className="article-hero" src={p.coverImage} alt={p.title} /> : null}

          <div className="article-layout">
            <aside className="article-share"><div className="article-share-label">Share</div><div className="share-links"><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE}/${p.slug}/`)}`} target="_blank" rel="noreferrer">f</a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${SITE}/${p.slug}/`)}&text=${encodeURIComponent(p.title)}`} target="_blank" rel="noreferrer">X</a><a href={`mailto:?subject=${encodeURIComponent(p.title)}&body=${encodeURIComponent(`${SITE}/${p.slug}/`)}`}>@</a></div></aside>
            <article>
              <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
              <section className="comments-wrap">
                <h2>Comments</h2>
                {comments.map((c) => <div className="comment" key={c.id}><strong>{c.name}</strong><p>{c.body}</p></div>)}
                <form className="comment-form" action="/api/comments" method="post">
                  <input type="hidden" name="postId" value={p.id} />
                  <input name="name" placeholder="Your name" required />
                  <input name="email" type="email" placeholder="Email (optional)" />
                  <textarea name="body" placeholder="Write a comment…" required />
                  <button className="button" type="submit">Submit comment</button>
                  <small className="muted">Comments are held for moderation before appearing publicly.</small>
                </form>
              </section>
            </article>
            <div aria-hidden="true" />
          </div>

          {related.length ? (
            <section className="article-related public-section">
              <div className="public-section-head"><h2 className="public-section-title">More stories <span className="bn">আরও লেখা</span></h2><Link className="public-all" href="/">All stories →</Link></div>
              <div className="article-related-grid">
                {related.map((post) => <article className="related-card" key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}<span className="public-label red">{post.categoryName || 'Journal'}</span><h3><Link href={`/${post.slug}/`}>{post.title}</Link></h3><div className="byline">{formatDate(post.publishedAt)}</div></article>)}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <footer className="public-footer"><div className="public-container"><div className="footer-grid"><div><div className="footer-brand">SUHANUR RAHMAN</div><p className="footer-tagline">An independent journal covering technology, research, investigations, digital culture and ideas.</p></div><div className="footer-col"><h3>The newsroom</h3><Link href="/">Journal</Link><Link href="/admin/">CMS</Link><a href="https://suhanurrahman.com/">Portfolio ↗</a></div><div className="footer-col"><h3>Keep in touch</h3><a href="mailto:suhanurrahman.r@gmail.com">Email ↗</a><a href="https://suhanurrahman.com/">Website ↗</a></div><div className="footer-col"><h3>Follow</h3><a href="/">RSS feed</a><Link href="/">All stories</Link></div></div><div className="footer-bottom"><span>© 2026 Suhanur Rahman</span><span>Independent journal · Bangladesh</span></div></div></footer>
    </div>
  )
}
