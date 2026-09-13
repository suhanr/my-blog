import Link from 'next/link'
import { getCategories, listPublishedPosts } from '@/lib/db'

export const dynamic = 'force-dynamic'

function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

function shortText(value: string | null, max = 180) {
  const text = (value || '').trim()
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

function isBangla(value: string) {
  return /[\u0980-\u09FF]/.test(value)
}

function Header({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const nav = categories.slice(0, 7)
  return (
    <>
      <div className="public-topline">
        <div className="public-container public-topline-inner">
          <span>Journalism in the public interest.</span>
          <Link href="/">জনস্বার্থে সাংবাদিকতা</Link>
        </div>
      </div>
      <header className="public-header">
        <div className="public-container public-header-main">
          <div className="public-menu">
            <span className="public-icon" aria-hidden="true">☰</span>
            <Link href="/" className="public-menu-link">Journal</Link>
          </div>
          <Link href="/" className="public-wordmark">SUHANUR RAHMAN<span>জার্নাল</span></Link>
          <div className="public-actions">
            <Link href="/admin/">CMS</Link>
            <a href="https://suhanurrahman.com/">Portfolio ↗</a>
            <span className="public-icon" aria-hidden="true">⌕</span>
          </div>
        </div>
        <div className="public-navrow">
          <nav className="public-container public-navrow-inner" aria-label="Journal sections">
            {nav.map((category) => <Link key={category.id} href={`/category/${category.slug}/`}>{category.name}</Link>)}
            <Link href="/">All stories</Link>
          </nav>
        </div>
      </header>
    </>
  )
}

function StoryCard({ post }: { post: any }) {
  const bangla = isBangla(post.title)
  return (
    <article className="story-card">
      {post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}
      <span className="public-label red">{post.categoryName || 'Journal'}</span>
      <h3 className={`story-card-title${bangla ? ' bangla' : ''}`}><Link href={`/${post.slug}/`}>{post.title}</Link></h3>
      <p className="story-card-dek">{shortText(post.excerpt, 155)}</p>
      <div className="byline">{formatDate(post.publishedAt)} · Suhanur Rahman</div>
    </article>
  )
}

export default async function Home() {
  const [posts, categories] = await Promise.all([listPublishedPosts(24), getCategories()])
  const featured = posts[0]
  const side = posts.slice(1, 3)
  const latest = posts.slice(3, 9)
  const numbered = posts.slice(9, 13)
  const analysis = posts.slice(13, 15)
  const opinion = posts.slice(15, 19)
  const photo = posts.slice(19, 22)
  const videos = posts.slice(22, 24)

  return (
    <div className="site-public">
      <Header categories={categories} />
      <main className="public-main">
        <div className="public-container">
          {featured ? (
            <section className="public-section" id="reports">
              <div className="lead-grid">
                <article className="lead-main">
                  <span className="public-label red">{featured.categoryName || 'Featured report'}</span>
                  <h1 className="lead-title"><Link href={`/${featured.slug}/`}>{featured.title}</Link></h1>
                  <p className="lead-dek">{shortText(featured.excerpt, 250)}</p>
                  <div className="byline">{formatDate(featured.publishedAt)} · By Suhanur Rahman</div>
                  {featured.coverImage ? <Link href={`/${featured.slug}/`}><img className="lead-image" src={featured.coverImage} alt={featured.title} /></Link> : null}
                </article>
                <div className="lead-side">
                  {side.map((post: any) => (
                    <article key={post.id}>
                      <span className="public-label">{post.categoryName || 'Latest'}</span>
                      <h2 className="side-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h2>
                      <p className="side-dek">{shortText(post.excerpt, 125)}</p>
                      <div className="byline">{formatDate(post.publishedAt)} · Suhanur Rahman</div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <section className="public-section">
            <div className="public-section-head"><h2 className="public-section-title">Latest stories <span className="bn">সাম্প্রতিক লেখা</span></h2><Link className="public-all" href="/">All stories →</Link></div>
            <div className="story-list">
              {latest.map((post: any) => <StoryCard key={post.id} post={post} />)}
            </div>
          </section>

          {numbered.length ? (
            <section className="public-section">
              <div className="public-section-head"><h2 className="public-section-title">In focus <span className="bn">নজরে</span></h2><span className="public-all">Selected stories</span></div>
              <div>
                {numbered.map((post: any, index) => (
                  <article className="numbered-feature" key={post.id}>
                    <div className="number">0{index + 1}</div>
                    <div><span className="public-label red">{post.categoryName || 'Journal'}</span><h3 className="numbered-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h3><p className="numbered-dek">{shortText(post.excerpt, 210)}</p></div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {analysis.length ? (
            <section className="public-section" id="analysis">
              <div className="public-section-head"><h2 className="public-section-title">Analysis <span className="bn">বিশ্লেষণ</span></h2><span className="public-all">Read more →</span></div>
              <div className="wide-grid">
                {analysis.map((post: any) => <article className="wide-card" key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}<span className="public-label red">{post.categoryName || 'Analysis'}</span><h3 className="wide-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h3><p className="story-card-dek">{shortText(post.excerpt, 200)}</p><div className="byline">By Suhanur Rahman</div></article>)}
              </div>
            </section>
          ) : null}

          {opinion.length ? (
            <section className="public-section" id="opinion">
              <div className="public-section-head"><h2 className="public-section-title">Opinion & debate <span className="bn">মতামত ও বিতর্ক</span></h2><span className="public-all">All opinion →</span></div>
              <div className="opinion-list">
                {opinion.map((post: any) => <article className="opinion-row" key={post.id}><h3 className="opinion-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h3><div className="opinion-author">{post.categoryName || 'Journal'}<br/>Suhanur Rahman</div></article>)}
              </div>
            </section>
          ) : null}
        </div>

        {photo.length ? (
          <section className="public-section photo-section">
            <div className="public-container">
              <div className="public-section-head"><h2 className="public-section-title">Photo stories <span className="bn">সচিত্র</span></h2><span className="public-all">All photo stories →</span></div>
              <div className="photo-grid">
                {photo.map((post: any) => <article className="photo-card" key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}<div className="photo-overlay"><h3 className="photo-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h3><p className="photo-dek">{shortText(post.excerpt, 130)}</p></div></article>)}
              </div>
            </div>
          </section>
        ) : null}

        {videos.length ? (
          <section className="public-container public-section">
            <div className="public-section-head"><h2 className="public-section-title">Films & video <span className="bn">ভিডিও</span></h2><span className="public-all">All video →</span></div>
            <div className="video-bar">
              {videos.map((post: any, index) => index === 0 ? <article className="video-lead" key={post.id}><span className="public-label red">Now playing</span><div className="video-lead-title"><Link href={`/${post.slug}/`}>{post.title}</Link></div><div className="byline">Open story →</div></article> : <article className="video-item" key={post.id}><div className="video-thumb">{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy" /> : null}<span className="play">▶</span></div><h3 className="video-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h3><div className="byline">Suhanur Rahman</div></article>)}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="site-public public-footer">
        <div className="public-container">
          <div className="footer-grid">
            <div><div className="footer-brand">SUHANUR RAHMAN</div><p className="footer-tagline">An independent journal covering technology, research, investigations, digital culture and ideas.</p></div>
            <div className="footer-col"><h3>Our journalism</h3>{categories.slice(0, 6).map((category) => <Link key={category.id} href={`/category/${category.slug}/`}>{category.name}</Link>)}</div>
            <div className="footer-col"><h3>The newsroom</h3><Link href="/">Journal</Link><Link href="/admin/">CMS</Link><a href="https://suhanurrahman.com/">Portfolio ↗</a><Link href="/">Privacy</Link></div>
            <div className="footer-col"><h3>Keep in touch</h3><a href="https://suhanurrahman.com/">Website ↗</a><a href="mailto:suhanurrahman.r@gmail.com">Email ↗</a><Link href="/">RSS feed</Link></div>
          </div>
          <div className="footer-bottom"><span>© 2026 Suhanur Rahman</span><span>Independent journal · Bangladesh</span></div>
        </div>
      </footer>
    </div>
  )
}
