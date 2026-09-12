import Link from 'next/link'

const featured = [
  { title: 'Your first article will live here', slug: '#', date: 'Coming soon', category: 'Journal', excerpt: 'This starter homepage is ready for the WordPress migration and publishing CMS.' },
  { title: 'A publishing system built around your own data', slug: '#', date: 'Coming soon', category: 'Technology', excerpt: 'The final system will support posts, categories, tags, media, comments and SEO metadata.' },
  { title: 'From WordPress to a modern publishing stack', slug: '#', date: 'Coming soon', category: 'Research', excerpt: 'Existing WordPress content can be imported while keeping the public URLs as stable as possible.' },
]

export default function Home() {
  return (
    <main>
      <header className="header"><div className="container header-inner"><Link className="brand" href="/">SUHANUR RAHMAN / JOURNAL</Link><nav className="nav"><Link href="/">Journal</Link><Link href="/admin/">Admin</Link><a href="https://suhanurrahman.com/">Portfolio ↗</a></nav></div></header>
      <div className="container">
        <section className="hero">
          <p className="kicker">Independent journal</p>
          <h1 className="serif">Technology, research, investigations and ideas.</h1>
          <p>A personal publishing space by Suhanur Rahman. The public side is designed like an editorial journal; the private side will provide a focused publishing workflow for posts, categories, tags, media and comments.</p>
        </section>
        <section className="section">
          <div className="meta">01 / Latest stories</div>
          <h2 className="section-title">Latest writing</h2>
          <div className="grid">{featured.map((post) => <article className="card border" key={post.title}><div className="card-body"><span className="tag">{post.category}</span><h2>{post.title}</h2><p className="meta">{post.date}</p><p className="muted">{post.excerpt}</p><Link className="meta" href={post.slug}>Read article ↗</Link></div></article>)}</div>
        </section>
      </div>
      <footer className="footer"><div className="container">© 2026 Suhanur Rahman · Journal</div></footer>
    </main>
  )
}
