import Link from 'next/link'
import { listPublishedPosts } from '@/lib/db'

export const dynamic = 'force-dynamic'

function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export default async function Home() {
  const posts = await listPublishedPosts(18)
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <main>
      <header className="header"><div className="container header-inner"><Link className="brand" href="/">SUHANUR RAHMAN / JOURNAL</Link><nav className="nav"><Link href="/">Journal</Link><Link href="/admin/">Admin</Link><a href="https://suhanurrahman.com/">Portfolio ↗</a></nav></div></header>
      <div className="container">
        <section className="hero">
          <p className="kicker">Independent journal</p>
          <h1 className="serif">Technology, research, investigations and ideas.</h1>
          <p>A personal publishing space by Suhanur Rahman, built around long-form writing, research notes and technical work.</p>
        </section>
        {featured ? <section className="featured border"><div className="featured-copy"><span className="tag">{featured.categoryName || 'Journal'}</span><h2 className="serif"><Link href={`/${featured.slug}/`}>{featured.title}</Link></h2><p>{featured.excerpt || ''}</p><div className="meta">{formatDate(featured.publishedAt)}</div><Link className="read" href={`/${featured.slug}/`}>Read story ↗</Link></div>{featured.coverImage ? <img src={featured.coverImage} alt={featured.title} /> : null}</section> : null}
        <section className="section"><div className="meta">01 / Latest stories</div><h2 className="section-title">Latest writing</h2>{posts.length ? <div className="grid">{rest.map((post) => <article className="card border" key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}<div className="card-body"><span className="tag">{post.categoryName || 'Journal'}</span><h2><Link href={`/${post.slug}/`}>{post.title}</Link></h2><p className="meta">{formatDate(post.publishedAt)}</p><p className="muted">{post.excerpt || ''}</p><Link className="meta" href={`/${post.slug}/`}>Read article ↗</Link></div></article>)}</div> : <div className="empty border">No published posts yet. Publish your first story from the admin portal.</div>}</section>
      </div>
      <footer className="footer"><div className="container">© 2026 Suhanur Rahman · Journal</div></footer>
    </main>
  )
}
