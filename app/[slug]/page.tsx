import type { Metadata } from 'next'
import Link from 'next/link'
import { getComments, getPostBySlug } from '@/lib/db'
import { markdownToHtml } from '@/lib/markdown'

const SITE = 'https://blog.suhanurrahman.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Not Found' }
  return {
    title: post.title,
    description: post.excerpt || `${post.title} by Suhanur Rahman.`,
    alternates: { canonical: `${SITE}/${post.slug}/` },
    openGraph: { type: 'article', url: `${SITE}/${post.slug}/`, title: post.title, description: post.excerpt || undefined, images: post.coverImage ? [{ url: post.coverImage }] : undefined, publishedTime: post.publishedAt || undefined, modifiedTime: post.updatedAt },
  }
}

function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return <main className="container article-shell"><h1 className="serif">Article not found</h1><Link href="/">Back to journal</Link></main>
  const comments = await getComments(post.id)
  const html = markdownToHtml(post.content)
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt || undefined, datePublished: post.publishedAt || undefined, dateModified: post.updatedAt, mainEntityOfPage: `${SITE}/${post.slug}/`, author: { '@type': 'Person', name: 'Suhanur Rahman', url: 'https://suhanurrahman.com/' }, image: post.coverImage ? [post.coverImage] : undefined, articleSection: post.categoryName || undefined }

  return <main><header className="header"><div className="container header-inner"><Link className="brand" href="/">SUHANUR RAHMAN / JOURNAL</Link><nav className="nav"><Link href="/">Journal</Link><a href="https://suhanurrahman.com/">Portfolio ↗</a></nav></div></header><div className="container article-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><article><header className="article-head"><Link className="meta" href={post.categorySlug ? `/category/${post.categorySlug}/` : '/'}>{post.categoryName || 'Journal'}</Link><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt || ''}</p><div className="article-meta"><span>{formatDate(post.publishedAt)}</span><span>·</span><span>By Suhanur Rahman</span></div></header>{post.coverImage ? <img className="article-cover" src={post.coverImage} alt={post.title} /> : null}<div className="prose" dangerouslySetInnerHTML={{ __html: html }} /><section className="comments"><h2 className="serif">Comments</h2>{comments.map((comment) => <div className="comment" key={comment.id}><strong>{comment.name}</strong><p>{comment.body}</p></div>)}<form className="comment-form" action="/api/comments" method="post"><input type="hidden" name="postId" value={post.id} /><input name="name" placeholder="Your name" required /><input name="email" type="email" placeholder="Email (optional)" /><textarea name="body" placeholder="Write a comment…" required /><button className="button" type="submit">Submit comment</button><small className="muted">Comments are held for moderation before appearing publicly.</small></form></section></article></div><footer className="footer"><div className="container">© 2026 Suhanur Rahman · Journal</div></footer></main>
}
