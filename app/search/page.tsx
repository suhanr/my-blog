import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getHeaderMenu, searchPublishedPosts } from '@/lib/db'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { RevealInit } from '@/app/components/public/enhancers'

export const metadata: Metadata = {
  title: 'সার্চ — Journal',
  description: 'সুহানুর রহমানের জার্নালে লেখা খুঁজুন।',
  alternates: { canonical: 'https://blog.suhanurrahman.com/search/' },
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim().slice(0, 100)
  const [categories, menu, posts] = await Promise.all([
    getCategories(),
    getHeaderMenu(),
    searchPublishedPosts(query, 30),
  ])

  return (
    <div className="site-public">
      <style>{`
        .site-public .search-page { padding: 76px 0 110px; }
        .site-public .search-hero { max-width: 860px; margin: 0 auto 52px; }
        .site-public .search-kicker { margin-bottom: 10px; font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--accent); }
        .site-public .search-title { margin: 0; font-size: clamp(42px, 7vw, 78px); line-height: 1; letter-spacing: -.04em; color: var(--fg); }
        .site-public .search-dek { max-width: 680px; margin: 18px 0 28px; color: var(--muted); font-size: 17px; line-height: 1.8; }
        .site-public .search-form { display: flex; gap: 10px; padding: 8px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow-sm); }
        .site-public .search-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--fg); padding: 10px 12px; font: inherit; font-size: 18px; }
        .site-public .search-submit { border: 0; border-radius: 10px; padding: 10px 18px; background: var(--accent); color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
        .site-public .search-summary { margin: 0 0 18px; color: var(--muted); font-size: 14px; }
        .site-public .search-results { display: grid; gap: 0; border-top: 1px solid var(--line-2); }
        .site-public .search-result { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 22px; padding: 24px 0; border-bottom: 1px solid var(--line-2); }
        .site-public .search-result-thumb { width: 170px; height: 112px; object-fit: cover; border-radius: 10px; background: var(--bg-2); }
        .site-public .search-result-placeholder { display: grid; place-items: center; color: var(--muted); font-size: 11px; }
        .site-public .search-result-category { margin-bottom: 7px; font-size: 11px; font-weight: 700; color: var(--accent); }
        .site-public .search-result-title { margin: 0 0 7px; font-size: clamp(20px, 2.2vw, 28px); line-height: 1.25; color: var(--fg); }
        .site-public .search-result-title a:hover { color: var(--accent); }
        .site-public .search-result-excerpt { margin: 0; color: var(--muted); line-height: 1.75; font-size: 15px; }
        .site-public .search-empty { padding: 40px 0; border-top: 1px solid var(--line-2); color: var(--muted); font-size: 16px; }
        .site-public .search-empty strong { color: var(--fg); }
        @media (max-width: 720px) {
          .site-public .search-page { padding: 52px 0 80px; }
          .site-public .search-form { flex-direction: column; }
          .site-public .search-submit { width: 100%; }
          .site-public .search-result { grid-template-columns: 1fr; gap: 14px; }
          .site-public .search-result-thumb { width: 100%; height: 190px; }
        }
      `}</style>

      <PublicHeader categories={categories} menu={menu} />
      <main className="mag-main search-page">
        <div className="mag-container">
          <section className="search-hero reveal">
            <div className="search-kicker">Search</div>
            <h1 className="search-title">লেখা খুঁজুন</h1>
            <p className="search-dek">শিরোনাম বা সংক্ষিপ্ত বর্ণনা দিয়ে জার্নালের লেখা খুঁজে দেখুন।</p>
            <form className="search-form" action="/search/" method="get">
              <input className="search-input" name="q" value={query} placeholder="যা খুঁজছেন লিখুন…" aria-label="Search query" />
              <button className="search-submit" type="submit">খুঁজুন</button>
            </form>
          </section>

          {query ? (
            <section>
              <p className="search-summary">{posts.length ? `${posts.length}টি ফলাফল` : 'কোনো ফলাফল পাওয়া যায়নি'} · “{query}”</p>
              {posts.length ? (
                <div className="search-results">
                  {posts.map((post) => (
                    <article className="search-result reveal" key={post.id}>
                      {post.coverImage ? <img className="search-result-thumb" src={post.coverImage} alt="" /> : <div className="search-result-thumb search-result-placeholder">No image</div>}
                      <div>
                        <div className="search-result-category">{post.categoryName || 'Journal'}</div>
                        <h2 className="search-result-title"><Link href={`/${post.slug}/`}>{post.title}</Link></h2>
                        {post.excerpt ? <p className="search-result-excerpt">{post.excerpt}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="search-empty">“<strong>{query}</strong>” নামে বা বর্ণনায় কোনো প্রকাশিত লেখা পাওয়া যায়নি।</div>
              )}
            </section>
          ) : null}
        </div>
      </main>
      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
