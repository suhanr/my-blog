'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PenSquare,
  Tags,
  Trash2,
  X,
} from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  /** Match this route and everything nested under it. */
  match?: string
}

const NAV: NavItem[] = [
  { href: '/admin/', label: 'Dashboard', icon: LayoutDashboard, match: '/admin' },
  { href: '/admin/posts/new/', label: 'New post', icon: PenSquare, match: '/admin/posts' },
  { href: '/admin/media/', label: 'Media', icon: ImageIcon, match: '/admin/media' },
  { href: '/admin/taxonomy/', label: 'Categories & tags', icon: Tags, match: '/admin/taxonomy' },
  { href: '/admin/comments/', label: 'Comments', icon: MessageSquare, match: '/admin/comments' },
  { href: '/admin/trash/', label: 'Trash', icon: Trash2, match: '/admin/trash' },
]

function normalize(path: string) {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = normalize(usePathname() || '/admin')
  const [open, setOpen] = useState(false)

  // The login screen is standalone — render it without the admin chrome.
  const isLogin = pathname === '/admin/login'

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (isLogin) return <>{children}</>

  function isActive(item: NavItem) {
    const base = item.match ?? normalize(item.href)
    if (base === '/admin') return pathname === '/admin'
    return pathname === base || pathname.startsWith(base + '/')
  }

  const sidebar = (
    <aside className={`admin-sidebar${open ? ' is-open' : ''}`}>
      <div className="admin-workspace">
        <span className="admin-workspace-mark">SR</span>
        <span className="admin-workspace-name">
          <strong>Suhanur Rahman</strong>
          <small>CMS workspace</small>
        </span>
      </div>

      <p className="admin-nav-label">Navigate</p>
      <nav className="admin-nav">
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={isActive(item) ? 'is-active' : ''}>
              <Icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <p className="admin-nav-label admin-nav-label--more">More</p>
      <nav className="admin-nav admin-nav--secondary">
        <Link href="/" target="_blank" rel="noreferrer">
          <ExternalLink size={16} strokeWidth={2} />
          <span>View journal</span>
        </Link>
        <form action="/api/admin/logout" method="post">
          <button type="submit">
            <LogOut size={16} strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </form>
      </nav>
    </aside>
  )

  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <Link href="/admin/" className="admin-brand">
          Suhanur Rahman <span>/ CMS</span>
        </Link>
        <div className="admin-topbar-actions">
          <Link href="/" className="admin-topbar-link" target="_blank" rel="noreferrer">
            <span>View site</span> <ExternalLink size={13} />
          </Link>
          <span className="admin-avatar" aria-hidden="true">SR</span>
        </div>
      </header>

      <div className="admin-layout">
        {sidebar}
        {open && <button type="button" className="admin-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
