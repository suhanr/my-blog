import Link from 'next/link'

export default function PublicFooter({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  return (
    <footer className="mag-footer">
      <div className="mag-container mag-footer-grid">
        <div>
          <div className="mag-footer-brand">সুহানুর <b>রহমান</b></div>
          <p>প্রযুক্তি, গবেষণা, অনুসন্ধান, ডিজিটাল সংস্কৃতি ও ভাবনা নিয়ে একটি স্বাধীন জার্নাল।</p>
        </div>
        <div>
          <h4>বিভাগ</h4>
          {categories.slice(0, 6).map((c) => <Link key={c.id} href={`/category/${c.slug}/`}>{c.name}</Link>)}
        </div>
        <div>
          <h4>নিউজরুম</h4>
          <Link href="/">হোম</Link>
          <Link href="/admin/">CMS</Link>
          <a href="https://suhanurrahman.com/">Portfolio ↗</a>
        </div>
        <div>
          <h4>যোগাযোগ</h4>
          <a href="mailto:suhanurrahman.r@gmail.com">Email ↗</a>
          <a href="https://suhanurrahman.com/">Website ↗</a>
        </div>
      </div>
      <div className="mag-container mag-footer-bottom">
        <span>© 2026 Suhanur Rahman</span>
        <span>Independent journal · Bangladesh</span>
      </div>
    </footer>
  )
}
