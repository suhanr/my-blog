'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Archive,
  Check,
  ChevronRight,
  ExternalLink,
  Eye,
  Grid2X2,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

type Post = {
  id: string
  title: string
  slug: string
  status: 'PUBLISHED' | 'DRAFT'
  coverImage: string | null
  updatedAt: string
}

type Counts = {
  all: number
  published: number
  drafts: number
  comments: number
  categories: number
  tags: number
  trash: number
}

type Tab = 'all' | 'published' | 'drafts'

type Props = {
  posts: Post[]
  counts: Counts
}

export default function AdminDashboardInteractive({ posts, counts }: Props) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      const matchesTab = tab === 'all' || (tab === 'published' ? post.status === 'PUBLISHED' : post.status === 'DRAFT')
      const matchesQuery = !q || post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [posts, query, tab])

  const allVisibleSelected = filtered.length > 0 && filtered.every((post) => selected.includes(post.id))

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function selectAll() {
    setSelected(allVisibleSelected ? [] : filtered.map((post) => post.id))
  }

  async function bulkAction(action: 'publish' | 'draft' | 'trash') {
    if (!selected.length || busy) return
    setBusy(true)
    setNotice(null)
    try {
      const response = await fetch('/api/admin/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected, action }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Action failed')
      const label = action === 'trash' ? 'moved to Trash' : action === 'publish' ? 'published' : 'saved as drafts'
      setNotice(`${selected.length} post${selected.length > 1 ? 's' : ''} ${label}.`)
      setSelected([])
      window.location.reload()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  function editSelected() {
    if (selected.length !== 1) return
    window.location.href = `/admin/posts/${selected[0]}/edit/`
  }

  return (
    <div className="admin-wrap">
      <div className="admin-appbar">
        <div className="admin-appbar-brand">Suhanur Rahman <span>/ CMS</span></div>
        <nav className="admin-topnav">
          <Link href="/admin/">Dashboard</Link>
          <Link href="/admin/posts/new/">New post</Link>
          <Link href="/admin/comments/">Comments</Link>
          <Link href="/">View site <ExternalLink size={11} /></Link>
        </nav>
        <div className="admin-appbar-actions">
          <label className="admin-global-search">
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts..." aria-label="Search posts" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}
            <kbd>⌘K</kbd>
          </label>
          <span className="admin-avatar">SR</span>
        </div>
      </div>

      <div className="admin-shell">
        <div className="admin-rail" aria-hidden="true">
          <div className="admin-rail-avatar">SR</div>
          <div className="admin-rail-dot is-green">✓</div>
          <div className="admin-rail-dot is-orange">+</div>
        </div>

        <aside className="admin-side">
          <div className="admin-workspace">
            <div className="admin-workspace-mark">SR</div>
            <div><strong>Suhanur Rahman</strong><span>CMS workspace</span></div>
            <span className="admin-chevron">⌄</span>
          </div>
          <div className="admin-section-label">Navigate</div>
          <nav className="admin-nav">
            <Link className="is-active" href="/admin/">Dashboard <ChevronRight size={14} /></Link>
            <Link href="/admin/posts/new/">Posts <ChevronRight size={14} /></Link>
            <Link href="/admin/media/">Media <ChevronRight size={14} /></Link>
            <Link href="/admin/taxonomy/">Categories & tags <ChevronRight size={14} /></Link>
            <Link href="/admin/comments/">Comments <ChevronRight size={14} /></Link>
            <Link href="/admin/trash/">Trash <ChevronRight size={14} /></Link>
          </nav>
          <div className="admin-section-label admin-section-label--more">More</div>
          <nav className="admin-nav admin-nav-secondary">
            <Link href="/">View journal <ExternalLink size={13} /></Link>
            <form action="/api/admin/logout" method="post"><button type="submit">Sign out <ExternalLink size={13} /></button></form>
          </nav>
        </aside>

        <main className="admin-main admin-main--workspace">
          <div className="admin-breadcrumb"><span className="admin-breadcrumb-icon">▧</span><span>Pages</span><b>›</b><strong>Dashboard</strong></div>

          <div className="admin-page-head">
            <div>
              <h1>Posts</h1>
              <p>Manage your journal posts and publishing workflow.</p>
            </div>
            <Link className="admin-primary-button" href="/admin/posts/new/"><Plus size={15} /> Add Post</Link>
          </div>

          <div className="admin-tabs">
            <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>All Posts <b>{counts.all}</b></button>
            <button className={tab === 'published' ? 'is-active' : ''} onClick={() => setTab('published')}>Published <b>{counts.published}</b></button>
            <button className={tab === 'drafts' ? 'is-active' : ''} onClick={() => setTab('drafts')}>Drafts <b>{counts.drafts}</b></button>
            <Link href="/admin/comments/">Comments <b>{counts.comments}</b></Link>
          </div>

          <div className="admin-bulkbar">
            <button className="admin-ghost-button" type="button" onClick={selectAll}>
              {allVisibleSelected ? <Check size={13} /> : <span className="admin-select-dot" />}
              {allVisibleSelected ? 'Clear selection' : 'Select All'}
            </button>
            <div className="admin-bulk-actions">
              <button type="button" onClick={editSelected} disabled={selected.length !== 1}><Pencil size={13} /> Edit</button>
              <button type="button" onClick={() => bulkAction('trash')} disabled={!selected.length || busy}><Trash2 size={13} /> Delete</button>
              <button type="button" onClick={() => setQuery('')} disabled={!query}><Search size={13} /> Clear Search</button>
              <button type="button" onClick={() => bulkAction('publish')} disabled={!selected.length || busy}><Upload size={13} /> Publish</button>
              <button type="button" onClick={() => bulkAction('draft')} disabled={!selected.length || busy}><Archive size={13} /> Draft</button>
            </div>
            <div className="admin-view-toggle">
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-label="Grid view"><Grid2X2 size={15} /></button>
              <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-label="List view"><LayoutList size={15} /></button>
            </div>
          </div>

          {notice && <div className="admin-dashboard-notice">{notice}</div>}

          {view === 'grid' ? (
            <div className="admin-post-grid">
              {filtered.map((post) => (
                <article className={`admin-post-card${selected.includes(post.id) ? ' is-selected' : ''}`} key={post.id}>
                  <div className="admin-post-card-toolbar">
                    <input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggle(post.id)} aria-label={`Select ${post.title}`} />
                    <div>
                      <Link href={`/admin/posts/${post.id}/edit/`} aria-label={`Edit ${post.title}`}><Pencil size={13} /></Link>
                      <Link href={`/${post.slug}/`} aria-label={`View ${post.title}`}><Eye size={13} /></Link>
                    </div>
                  </div>
                  <Link className="admin-post-card-image" href={`/admin/posts/${post.id}/edit/`}>
                    {post.coverImage ? <img src={post.coverImage} alt="" /> : <div className="admin-post-placeholder" />}
                  </Link>
                  <div className="admin-post-card-body">
                    <Link href={`/admin/posts/${post.id}/edit/`} className="admin-post-card-title">{post.title}</Link>
                    <div className="admin-post-card-meta"><span>{post.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span><span>{new Date(post.updatedAt).toLocaleDateString('en-GB')}</span></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-post-list">
              {filtered.map((post) => (
                <div className={`admin-post-list-row${selected.includes(post.id) ? ' is-selected' : ''}`} key={post.id}>
                  <input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggle(post.id)} aria-label={`Select ${post.title}`} />
                  <div className="admin-post-list-thumb">{post.coverImage ? <img src={post.coverImage} alt="" /> : null}</div>
                  <div className="admin-post-list-main"><Link href={`/admin/posts/${post.id}/edit/`}>{post.title}</Link><span>/{post.slug}</span></div>
                  <span className={`admin-status-pill ${post.status === 'PUBLISHED' ? 'is-published' : 'is-draft'}`}>{post.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                  <span className="admin-post-list-date">{new Date(post.updatedAt).toLocaleDateString('en-GB')}</span>
                  <Link className="admin-icon-link" href={`/admin/posts/${post.id}/edit/`} aria-label={`Edit ${post.title}`}><Pencil size={14} /></Link>
                </div>
              ))}
            </div>
          )}

          {!filtered.length && <div className="admin-empty-state"><Search size={20} /><strong>No posts found</strong><span>Try a different search or switch the status filter.</span></div>}

          <div className="admin-dashboard-footer"><span>{counts.categories} categories</span><span>{counts.tags} tags</span><Link href="/admin/trash/">{counts.trash} in trash</Link></div>
        </main>
      </div>
    </div>
  )
}
