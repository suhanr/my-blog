import Link from 'next/link'
import { getHeaderMenu } from '@/lib/db'

type MenuItem = {
  id: string
  categoryId: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  children: MenuItem[]
}

export default async function PublicFooter({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const menu: MenuItem[] = await getHeaderMenu()
  const footerMenu = menu.length
    ? menu
    : categories.slice(0, 6).map((c, index) => ({
        id: `fallback-${c.id}`,
        categoryId: c.id,
        name: c.name,
        slug: c.slug,
        parentId: null,
        sortOrder: index,
        children: [],
      }))

  return (
    <footer className="mag-footer">
      <style>{`
        .site-public .mag-footer-brand {
          font-size: 26px !important;
          font-weight: 800;
          line-height: 1.2;
          display: inline-flex;
          align-items: baseline;
          white-space: nowrap;
        }
        .site-public .mag-footer-dept-nav {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .site-public .mag-footer-dept-item {
          position: relative;
        }
        .site-public .mag-footer-dept-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 15px;
          font-weight: 600;
          color: var(--muted);
          white-space: nowrap;
          padding: 5px 0;
          transition: color 0.18s ease;
        }
        .site-public .mag-footer-dept-link:hover,
        .site-public .mag-footer-dept-item:focus-within > .mag-footer-dept-link {
          color: var(--accent);
        }
        .site-public .mag-footer-dept-chevron {
          font-size: 11px;
          line-height: 1;
          transition: transform 0.18s ease;
        }
        .site-public .mag-footer-dept-item:hover .mag-footer-dept-chevron,
        .site-public .mag-footer-dept-item:focus-within .mag-footer-dept-chevron {
          transform: rotate(180deg);
        }
        .site-public .mag-footer-dept-dropdown {
          position: absolute;
          left: 0;
          bottom: calc(100% + 8px);
          min-width: 190px;
          padding: 8px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(6px);
          transition: opacity 0.16s ease, transform 0.16s ease, visibility 0.16s ease;
          z-index: 260;
        }
        .site-public .mag-footer-dept-dropdown a {
          display: block;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.35;
          color: var(--fg);
        }
        .site-public .mag-footer-dept-dropdown a:hover {
          background: var(--bg-2);
          color: var(--accent);
        }
        .site-public .mag-footer-dept-item:hover .mag-footer-dept-dropdown,
        .site-public .mag-footer-dept-item:focus-within .mag-footer-dept-dropdown {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }
        @media (max-width: 720px) {
          .site-public .mag-footer-dept-nav {
            gap: 10px 16px;
          }
        }
      `}</style>

      <div className="mag-container mag-footer-grid">
        <div>
          <Link href="/" className="mag-footer-brand">
            সোহানুর <b>রহমান</b><span style={{ fontSize: '0.5em', color: 'var(--accent)', marginLeft: 6, fontWeight: 600 }}>জার্নাল</span>
          </Link>
          <p>প্রযুক্তি, গবেষণা, অনুসন্ধান, ডিজিটাল সংস্কৃতি ও ভাবনা নিয়ে একটি স্বাধীন জার্নাল।</p>
        </div>

        <div>
          <h4>বিভাগ</h4>
          <nav className="mag-footer-dept-nav" aria-label="Footer sections">
            {footerMenu.map((item) => (
              <div key={item.id} className="mag-footer-dept-item">
                <Link href={`/category/${item.slug}/`} className="mag-footer-dept-link">
                  {item.name}
                  {item.children.length ? <span className="mag-footer-dept-chevron">⌄</span> : null}
                </Link>
                {item.children.length ? (
                  <div className="mag-footer-dept-dropdown">
                    {item.children.map((child) => (
                      <Link key={child.id} href={`/category/${child.slug}/`}>{child.name}</Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        <div>
          <h4>লিংকস</h4>
          <Link href="/">হোম</Link>
          <Link href="/admin/">CMS</Link>
          <a href="https://suhanurrahman.com/" target="_blank" rel="noreferrer">Portfolio ↗</a>
        </div>

        <div>
          <h4>যোগাযোগ</h4>
          <a href="mailto:suhanurrahman.r@gmail.com">Email ↗</a>
          <a href="https://suhanurrahman.com/" target="_blank" rel="noreferrer">Website ↗</a>
          <a href="https://suhanurrahman.com/contact/" target="_blank" rel="noreferrer">Contact ↗</a>
        </div>
      </div>
      <div className="mag-container mag-footer-bottom">
        <span>© 2026 Suhanur Rahman</span>
        <span>Independent journal · Bangladesh</span>
      </div>
    </footer>
  )
}
