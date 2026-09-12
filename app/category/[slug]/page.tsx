import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryBySlug } from '@/lib/db'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryBySlug(slug)
  return data ? { title: `${data.category.name} — Journal`, description: `Articles in ${data.category.name} by Suhanur Rahman.`, alternates: { canonical: `https://blog.suhanurrahman.com/category/${slug}/` } } : { title: 'Category not found' }
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : ''
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCategoryBySlug(slug)
  if (!data) return <main className="site-public"><div className="public-container article-top"><h1 className="article-title">Category not found</h1></div></main>
  return (
    <div className="site-public">
      <div className="public-topline"><div className="public-container public-topline-inner"><span>Journalism in the public interest.</span><Link href="/">জনস্বার্থে সাংবাদিকতা</Link></div></div>
      <header className="public-header">
        <div className="public-container public-header-main"><div className="public-menu"><span className="public-icon">☰</span><Link href="/">Journal</Link></div><Link href="/" className="public-wordmark">SUHANUR <span>JOURNAL</span><br/>RAHMAN</Link><div className="public-actions"><a href="https://suhanurrahman.com/">Portfolio ↗</a><span className="public-icon">⌕</span></div></div>
        <div className="public-navrow"><nav className="public-container public-navrow-inner"><Link href="/">Reports</Link><Link href="/">Analysis</Link><Link href="/">Opinion</Link><Link href="/">Research</Link><Link href="/">Data</Link><Link href="/">Photo stories</Link><Link href="/">Interviews</Link></nav></div>
      </header>
      <main className="public-main">
        <div className="public-container">
          <section className="public-section"><span className="public-label red">Category</span><h1 className="article-title" style={{fontSize:'clamp(48px,7vw,94px)',marginTop:'14px'}}>{data.category.name}</h1></section>
          <section className="public-section"><div className="story-list">{data.posts.map((post: any) => <article className="story-card" key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}<span className="public-label red">{data.category.name}</span><h2 className="story-card-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h2><p className="story-card-dek">{post.excerpt || ''}</p><div className="byline">{formatDate(post.publishedAt)} · Suhanur Rahman</div></article>)}</div></section>
        </div>
      </main>
      <footer className="public-footer"><div className="public-container"><div className="footer-grid"><div><div className="footer-brand">SUHANUR RAHMAN</div><p className="footer-tagline">An independent journal covering technology, research, investigations, digital culture and ideas.</p></div><div className="footer-col"><h3>The newsroom</h3><Link href="/">Journal</Link><Link href="/admin/">CMS</Link></div><div className="footer-col"><h3>Keep in touch</h3><a href="mailto:suhanurrahman.r@gmail.com">Email ↗</a><a href="https://suhanurrahman.com/">Website ↗</a></div><div className="footer-col"><h3>Follow</h3><Link href="/">RSS feed</Link><Link href="/">All stories</Link></div></div><div className="footer-bottom"><span>© 2026 Suhanur Rahman</span><span>Independent journal · Bangladesh</span></div></div></footer>
    </div>
  )
}
