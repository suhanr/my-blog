import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategories, getComments, getHeaderMenu, getPostBySlug, listPublishedPosts, type PublicComment } from '@/lib/db'
import { markdownToHtml } from '@/lib/markdown'
import { catColor, formatDate } from '@/lib/publicUi'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { PostCard, type Card } from '@/app/components/public/PostGrid'
import { Lightbox, ReadingProgress, RevealInit } from '@/app/components/public/enhancers'
import { AUTHOR_NAME, AUTHOR_URL, PROFILE_IMAGE, SITE, SITE_NAME, breadcrumbJsonLd, postDescription, postKeywords } from '@/lib/seo'

const SITE_ORIGIN = SITE

type CommentNode = PublicComment & { children: CommentNode[] }

function buildCommentTree(comments: PublicComment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>()
  for (const comment of comments) nodes.set(comment.id, { ...comment, children: [] })

  const roots: CommentNode[] = []
  for (const node of nodes.values()) {
    if (node.parentCommentId && nodes.has(node.parentCommentId)) nodes.get(node.parentCommentId)!.children.push(node)
    else roots.push(node)
  }
  return roots
}

function CommentThread({ postId, comment }: { postId: string; comment: CommentNode }) {
  return (
    <div className="mag-comment" key={comment.id}>
      <div className="mag-comment-author">{comment.name}</div>
      <p>{comment.body}</p>
      <details className="mag-reply-details">
        <summary>Reply</summary>
        <form className="mag-reply-form" action="/api/comments" method="post">
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="parentCommentId" value={comment.id} />
          <input name="name" placeholder="আপনার নাম" required />
          <input name="email" type="email" placeholder="ইমেইল (ঐচ্ছিক)" />
          <textarea name="body" placeholder="আপনার উত্তর লিখুন…" required />
          <button className="mag-btn primary" type="submit">রিপ্লাই পাঠান</button>
          <small>রিপ্লাই প্রকাশের আগে মডারেশনের জন্য অপেক্ষা করবে।</small>
        </form>
      </details>

      {comment.children.length ? (
        <div className="mag-comment-children">
          {comment.children.map((child) => <CommentThread key={child.id} postId={postId} comment={child} />)}
        </div>
      ) : null}
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getPostBySlug(slug)
  if (!p) return { title: 'লেখাটি পাওয়া যায়নি', robots: { index: false, follow: false } }

  const title = p.seoTitle || p.title
  const description = postDescription(p.title, p.seoDescription || p.excerpt)
  const canonical = p.canonicalUrl || `${SITE_ORIGIN}/${p.slug}/`
  const keywords = postKeywords(p.title, p.categoryName, p.seoKeywords)
  const image = p.ogImage || p.coverImage || PROFILE_IMAGE

  return {
    title,
    description,
    keywords,
    authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
    alternates: { canonical },
    robots: p.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      locale: 'bn_BD',
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      images: [{ url: image, alt: p.title }],
      publishedTime: p.publishedAt || undefined,
      modifiedTime: p.updatedAt || undefined,
      authors: [AUTHOR_URL],
      section: p.categoryName || undefined,
      tags: keywords,
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPostBySlug(slug)
  const [categories, menu] = await Promise.all([getCategories(), getHeaderMenu()])
  if (!p) notFound()

  const [comments, allPosts] = await Promise.all([getComments(p.id), listPublishedPosts(8)])
  const commentTree = buildCommentTree(comments)
  const related = allPosts.filter((post) => post.id !== p.id && (post.categoryId === p.categoryId || !p.categoryId)).slice(0, 3) as unknown as Card[]
  const html = p.contentFormat === 'HTML' ? p.content : markdownToHtml(p.content)
  const color = catColor(p.categoryName)
  const shareUrl = `${SITE_ORIGIN}/${p.slug}/`
  const image = p.ogImage || p.coverImage || PROFILE_IMAGE
  const description = postDescription(p.title, p.seoDescription || p.excerpt)
  const keywords = postKeywords(p.title, p.categoryName, p.seoKeywords)
  const wordCount = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${shareUrl}#article`,
    headline: p.title,
    description,
    url: shareUrl,
    inLanguage: 'bn-BD',
    datePublished: p.publishedAt || undefined,
    dateModified: p.updatedAt || p.publishedAt || undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    author: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL, image: PROFILE_IMAGE },
    publisher: { '@type': 'Person', name: AUTHOR_NAME, url: AUTHOR_URL, image: PROFILE_IMAGE },
    image: [image],
    articleSection: p.categoryName || undefined,
    keywords: keywords.join(', '),
    wordCount: wordCount || undefined,
  }
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'হোম', url: '/' },
    ...(p.categoryName && p.categorySlug ? [{ name: p.categoryName, url: `/category/${p.categorySlug}/` }] : []),
    { name: p.title, url: shareUrl },
  ])

  return (
    <div className="site-public mag-article" style={{ ['--cat' as string]: color }}>
      <style>{`
        .site-public .mag-comments { max-width:720px; margin:40px auto 0; }
        .site-public .mag-comment { padding:18px 0; border-bottom:1px solid var(--line-2); }
        .site-public .mag-comment-author { font-size:16px; font-weight:800; line-height:1.4; }
        .site-public .mag-comment p { font-size:15.5px; line-height:1.75; margin:6px 0 8px; color:var(--fg); white-space:pre-wrap; }
        .site-public .mag-comment-children { margin:12px 0 0 26px; padding-left:18px; border-left:2px solid var(--line-2); }
        .site-public .mag-reply-details { margin-top:6px; }
        .site-public .mag-reply-details > summary { display:inline-flex; align-items:center; cursor:pointer; color:var(--muted); font-size:14px; font-weight:700; list-style:none; }
        .site-public .mag-reply-details > summary::-webkit-details-marker { display:none; }
        .site-public .mag-reply-details > summary::before { content:'↳'; margin-right:6px; color:var(--faint); }
        .site-public .mag-reply-details[open] > summary { color:var(--accent); }
        .site-public .mag-reply-form { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:12px 0 4px; padding:14px; border:1px solid var(--line); border-radius:12px; background:var(--bg-2); }
        .site-public .mag-reply-form textarea { grid-column:1 / -1; min-height:110px; resize:vertical; }
        .site-public .mag-reply-form .mag-btn { width:max-content; }
        .site-public .mag-reply-form small { grid-column:1 / -1; color:var(--muted); font-size:12px; }
        @media (max-width:640px) {
          .site-public .mag-comment-children { margin-left:14px; padding-left:12px; }
          .site-public .mag-reply-form { grid-template-columns:1fr; }
          .site-public .mag-reply-form textarea,.site-public .mag-reply-form small { grid-column:auto; }
        }
      `}</style>
      <ReadingProgress />
      <PublicHeader categories={categories} menu={menu} />

      <main className="mag-main">
        <div className="mag-container">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

          <header className="mag-article-head reveal">
            {p.categoryName && p.categorySlug ? <Link className="mag-kicker" href={`/category/${p.categorySlug}/`}>{p.categoryName}</Link> : <div className="mag-kicker">Journal</div>}
            <h1 className="mag-article-title">{p.title}</h1>
            {p.excerpt ? <p className="mag-article-dek">{p.excerpt}</p> : null}
            <div className="mag-article-meta">
              <a href={AUTHOR_URL} target="_blank" rel="noreferrer"><b>{AUTHOR_NAME}</b></a>
              <span className="dot" />
              <span>{formatDate(p.publishedAt)}</span>
              {p.updatedAt ? <><span className="dot" /><span>হালনাগাদ {formatDate(p.updatedAt)}</span></> : null}
            </div>
          </header>

          {p.coverImage ? (
            <figure className="mag-article-figure reveal">
              <img className="mag-article-hero" src={p.coverImage} alt={p.title} decoding="async" fetchPriority="high" />
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
            {commentTree.length ? commentTree.map((comment) => <CommentThread key={comment.id} postId={p.id} comment={comment} />) : <p className="mag-meta">এখনও কোনো অনুমোদিত মন্তব্য নেই।</p>}

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
                <h2 className="mag-section-title">আরও লেখা</h2>
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
