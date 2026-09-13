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
      <div className="mag-container mag-footer-grid">
        <div>
          <Link href="/" className="mag-footer-brand">
            সোহানুর <b>রহমান</b><span style={{ fontSize: '0.5em', color: 'var(--accent)', marginLeft: 6, fontWeight: 600 }}>জার্নাল</span>
          </Link>
          <p>প্রযুক্তি, গবেষণা, অনুসন্ধান, ডিজিটাল সংস্কৃতি ও ভাবনা নিয়ে একটি স্বাধীন জার্নাল।</p>
        </div>

        <div>
          <h4>বিভাগ</h4>
          <div className="mag-footer-menu">
            {footerMenu.map((item) => (
              <div key={item.id} className="mag-footer-menu-group">
                <Link href={`/category/${item.slug}/`} className="mag-footer-menu-parent">{item.name}</Link>
                {item.children.length ? (
                  <div className="mag-footer-menu-children">
                    {item.children.map((child) => (
                      <Link key={child.id} href={`/category/${child.slug}/`}>{child.name}</Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
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
