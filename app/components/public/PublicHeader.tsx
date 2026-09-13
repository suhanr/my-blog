'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { BriefcaseBusiness, ChevronDown, Loader2, Menu, Moon, Search, Sun, X } from 'lucide-react'

type MenuItem = { id: string; categoryId: string; name: string; slug: string; parentId: string | null; sortOrder: number; children: MenuItem[] }
type Result = { title: string; slug: string; excerpt: string | null; coverImage: string | null; categoryName: string | null }
type Category = { id: string; name: string; slug: string }

export default function PublicHeader({ categories }: { categories: Category[] }) {
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null)
  const nav = (menuItems?.length ? menuItems : categories.slice(0, 7).map((c, index) => ({ id: `fallback-${c.id}`, categoryId: c.id, name: c.name, slug: c.slug, parentId: null, sortOrder: index, children: [] }))) as MenuItem[]
  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/header-menu', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && Array.isArray(data?.menu)) setMenuItems(data.menu) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const current = root.dataset.theme
    setDark(current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toggleTheme() {
    const root = document.documentElement
    const next = dark ? 'light' : 'dark'
    root.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch {}
    setDark(!dark)
  }

  return (
    <>
      <header className={`mag-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="mag-container mag-header-inner">
          <button className="mag-icon-btn mag-menu-btn" aria-label="Menu" onClick={() => setDrawer(true)}>
            <Menu size={19} strokeWidth={1.9} />
          </button>
          <Link href="/" className="mag-logo">সোহানুর <b>রহমান</b></Link>
          <nav className="mag-nav" aria-label="Sections">
            {nav.map((item) => (
              <div key={item.id} className={item.children.length ? 'mag-nav-dropdown' : 'mag-nav-item'}>
                <Link href={`/category/${item.slug}/`} className="mag-nav-link">
                  {item.name}
                  {item.children.length ? <ChevronDown className="mag-nav-chevron" size={13} strokeWidth={1.8} /> : null}
                </Link>
                {item.children.length ? <div className="mag-nav-submenu">{item.children.map((child) => <Link key={child.id} href={`/category/${child.slug}/`}>{child.name}</Link>)}</div> : null}
              </div>
            ))}
          </nav>
          <div className="mag-tools">
            <button className="mag-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={18} strokeWidth={1.9} /></button>
            <a className="mag-portfolio" href="https://suhanurrahman.com/" target="_blank" rel="noreferrer" aria-label="Portfolio"><BriefcaseBusiness size={17} strokeWidth={1.8} /><span>Portfolio</span></a>
            <button className="mag-icon-btn" aria-label="Toggle theme" onClick={toggleTheme}>{dark ? <Sun size={18} strokeWidth={1.9} /> : <Moon size={18} strokeWidth={1.9} />}</button>
          </div>
        </div>
      </header>

      {drawer && (
        <div className="mag-drawer is-open" role="dialog" aria-modal="true">
          <div className="mag-drawer-scrim" onClick={() => setDrawer(false)} />
          <div className="mag-drawer-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="mag-logo">সোহানুর <b>রহমান</b></span>
              <button className="mag-icon-btn" aria-label="Close" onClick={() => setDrawer(false)}><X size={18} /></button>
            </div>
            <Link href="/" onClick={() => setDrawer(false)}>হোম</Link>
            {nav.map((item) => (
              <div key={item.id} className="mag-drawer-group">
                <Link href={`/category/${item.slug}/`} onClick={() => setDrawer(false)}>{item.name}</Link>
                {item.children.length ? item.children.map((child) => <Link key={child.id} className="mag-drawer-child" href={`/category/${child.slug}/`} onClick={() => setDrawer(false)}>{child.name}</Link>) : null}
              </div>
            ))}
            <a className="mag-drawer-portfolio" href="https://suhanurrahman.com/" target="_blank" rel="noreferrer">Portfolio</a>
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  useEffect(() => {
    const term = q.trim()
    if (!term) { setResults([]); setTouched(false); return }
    setLoading(true)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        const data = await res.json()
        setResults(data.results || [])
        setTouched(true)
      } catch {} finally { setLoading(false) }
    }, 250)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  return (
    <div className="mag-search" onMouseDown={onClose}>
      <div className="mag-search-box" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mag-search-field">
          {loading ? <Loader2 className="spin" style={{ width: 20, height: 20 }} /> : <Search size={20} strokeWidth={1.9} />}
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="লেখা খুঁজুন…" aria-label="Search" />
          <button className="mag-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        {results.length > 0 && <div className="mag-search-results">{results.map((r) => (
          <Link key={r.slug} href={`/${r.slug}/`} className="mag-search-item" onClick={onClose}>
            {r.coverImage ? <img src={r.coverImage} alt="" /> : <span className="mag-search-item" style={{ padding: 0, width: 64, height: 48, background: 'var(--bg-2)', borderRadius: 8 }} />}
            <span style={{ minWidth: 0 }}><h4>{r.title}</h4><span>{r.categoryName || 'Journal'}</span></span>
          </Link>
        ))}</div>}
        {touched && !loading && !results.length && q.trim() && <div className="mag-search-results"><div className="mag-search-empty">“{q}” — কোনো ফলাফল পাওয়া যায়নি।</div></div>}
      </div>
    </div>
  )
}
