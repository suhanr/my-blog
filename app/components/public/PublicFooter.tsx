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
          flex-direction: column;
          align-items: stretch;
          gap: 2px;
        }
        .site-public .mag-footer-dept-item {
          border-bottom: 1px solid var(--line-2);
        }
        .site-public .mag-footer-dept-item:last-child {
          border-bottom: 0;
        }
        .site-public .mag-footer-dept-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 8px 0;
          color: var(--muted);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          list-style: none;
          user-select: none;
        }
        .site-public .mag-footer-dept-summary::-webkit-details-marker {
          display: none;
        }
        .site-public .mag-footer-dept-summary:hover,
        .site-public .mag-footer-dept-item[open] > .mag-footer-dept-summary {
          color: var(--accent);
        }
        .site-public .mag-footer-dept-chevron {
          flex: 0 0 auto;
          font-size: 13px;
          line-height: 1;
          transition: transform 0.18s ease;
        }
        .site-public .mag-footer-dept-item[open] .mag-footer-dept-chevron {
          transform: rotate(180deg);
        }
        .site-public .mag-footer-dept-dropdown {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 0 8px 14px;
        }
        .site-public .mag-footer-dept-dropdown a {
          display: block;
          padding: 5px 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.35;
          transition: color 0.18s ease;
        }
        .site-public .mag-footer-dept-dropdown a:hover {
          color: var(--accent);
        }
        @media (max-width: 720px) {
          .site-public .mag-footer-dept-summary {
            min-height: 42px;
            font-size: 16px;
          }
          .site-public .mag-footer-dept-dropdown a {
            font-size: 15px;
            padding: 6px 0;
          }
        }
      `}</style>

      <div className="mag-container mag-footer-grid">
        <div>
          <Link href="/" className="mag-footer-brand">
            সোহানুর{' '}<b>রহমান</b><span style={{ fontSize: '0.5em', color: 'var(--accent)', marginLeft: 6, fontWeight: 600 }}>জার্নাল</span>
          </Link>
          <p>প্রযুক্তি, গবেষণা, অনুসন্ধান, ডিজিটাল সংস্কৃতি ও ভাবনা নিয়ে একটি স্বাধীন জার্নাল।</p>
        </div>

        <div>
          <h4>বিভাগ</h4>
          <nav className="mag-footer-dept-nav" aria-label="Footer sections">
            {footerMenu.map((item) => (
              <details key={item.id} className="mag-footer-dept-item">
                <summary className="mag-footer-dept-summary">
                  <span>{item.name}</span>
                  {item.children.length ? <span className="mag-footer-dept-chevron" aria-hidden="true">⌄</span> : null}
                </summary>
                {item.children.length ? (
                  <div className="mag-footer-dept-dropdown">
                    {item.children.map((child) => (
                      <Link key={child.id} href={`/category/${child.slug}/`}>{child.name}</Link>
                    ))}
                  </div>
                ) : null}
              </details>
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
