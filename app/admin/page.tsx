import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

export default async function AdminDashboard() {
  await requireAdmin()
  const posts = await db.prepare(`SELECT id,title,slug,status,cover_image AS coverImage,updated_at AS updatedAt FROM posts WHERE deleted_at IS NULL ORDER BY datetime(updated_at) DESC LIMIT 50`).all<any>()
  const counts = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE status='PUBLISHED' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE status='DRAFT' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM comments WHERE status='PENDING' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM categories WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM tags WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE deleted_at IS NOT NULL`).first<any>(),
  ])
  return <div className="admin-wrap">
    <div className="admin-appbar"><div className="admin-appbar-brand">Suhanur Rahman <span>/ CMS</span></div><nav className="admin-topnav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/comments/">Comments</Link><Link href="/">View site ↗</Link></nav><div className="admin-appbar-actions"><div className="admin-search">Search <span>⌘K</span></div><span className="admin-icon-button">◔</span><span className="admin-avatar">SR</span></div></div>
    <div className="admin-shell">
      <div className="admin-rail"><div className="admin-rail-avatar">SR</div><div className="admin-rail-dot is-green">✓</div><div className="admin-rail-dot is-orange">+</div></div>
      <aside className="admin-side"><div className="admin-workspace"><div className="admin-workspace-mark">SR</div><div><strong>Suhanur Rahman</strong><span>CMS workspace</span></div><span className="admin-chevron">⌄</span></div><div className="admin-section-label">Navigate</div><nav className="admin-nav"><Link className="is-active" href="/admin/">Dashboard <span>›</span></Link><Link href="/admin/posts/new/">Posts <span>›</span></Link><Link href="/admin/media/">Media <span>›</span></Link><Link href="/admin/taxonomy/">Categories & tags <span>›</span></Link><Link href="/admin/comments/">Comments <span>›</span></Link><Link href="/admin/trash/">Trash <span>›</span></Link></nav><div className="admin-section-label admin-section-label--more">More</div><nav className="admin-nav admin-nav-secondary"><Link href="/">View journal <span>↗</span></Link><form action="/api/admin/logout" method="post"><button type="submit">Sign out <span>↗</span></button></form></nav></aside>
      <main className="admin-main admin-main--workspace">
        <div className="admin-breadcrumb"><span className="admin-breadcrumb-icon">▧</span><span>Pages</span><b>›</b><strong>Dashboard</strong></div>
        <div className="admin-page-head"><div><h1>Posts</h1><p>Manage your journal posts and publishing workflow.</p></div><Link className="admin-primary-button" href="/admin/posts/new/">＋ Add Post</Link></div>
        <div className="admin-tabs"><span className="is-active">All Posts <b>{String(counts[0]?.count || 0)}</b></span><span>Published <b>{String(counts[1]?.count || 0)}</b></span><span>Drafts <b>{String(counts[2]?.count || 0)}</b></span><span>Comments <b>{String(counts[3]?.count || 0)}</b></span></div>
        <div className="admin-bulkbar"><button className="admin-ghost-button" type="button">◉ Select All</button><div className="admin-bulk-actions"><button type="button">✎ Edit</button><button type="button">▣ Delete</button><button type="button">⌕ Search</button><button type="button">↑ Publish</button><button type="button">□ Draft</button><button type="button">▤ Archive</button></div><div className="admin-view-toggle"><button type="button" className="is-active">▦</button><button type="button">▤</button></div></div>
        <div className="admin-post-grid">{posts.results.map((post:any)=><article className="admin-post-card" key={post.id}><div className="admin-post-card-toolbar"><input type="checkbox" aria-label={`Select ${post.title}`} /><div><Link href={`/admin/posts/${post.id}/edit/`} aria-label={`Edit ${post.title}`}>✎</Link><Link href={`/${post.slug}/`} aria-label={`View ${post.title}`}>◉</Link></div></div><Link className="admin-post-card-image" href={`/admin/posts/${post.id}/edit/`}>{post.coverImage?<img src={post.coverImage} alt=""/>:<div className="admin-post-placeholder"/>}</Link><div className="admin-post-card-body"><Link href={`/admin/posts/${post.id}/edit/`} className="admin-post-card-title">{post.title}</Link><div className="admin-post-card-meta"><span>{post.status==='PUBLISHED'?'Published':'Draft'}</span><span>{new Date(post.updatedAt).toLocaleDateString('en-GB')}</span></div></div></article>)}</div>
        <div className="admin-dashboard-footer"><span>{String(counts[4]?.count || 0)} categories</span><span>{String(counts[5]?.count || 0)} tags</span><span>{String(counts[6]?.count || 0)} in trash</span></div>
      </main>
    </div>
  </div>
}
