import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

export default async function AdminDashboard() {
  await requireAdmin()
  const posts = await db.prepare(`SELECT id, title, slug, status, published_at AS publishedAt, updated_at AS updatedAt FROM posts ORDER BY datetime(updated_at) DESC LIMIT 50`).all<{id:string;title:string;slug:string;status:string;publishedAt:string|null;updatedAt:string}>()
  const counts = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM posts`).first<{count:number}>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE status='PUBLISHED'`).first<{count:number}>(),
    db.prepare(`SELECT COUNT(*) AS count FROM comments WHERE status='PENDING'`).first<{count:number}>(),
  ])
  return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/comments/">Comments</Link><Link href="/">View journal ↗</Link></nav><form action="/api/admin/logout" method="post" style={{marginTop:30}}><button className="meta" type="submit">Sign out</button></form></aside><main className="admin-main"><p className="kicker">Content management system</p><h1 className="serif">Dashboard</h1><div className="admin-grid" style={{margin:'25px 0'}}><div className="stat"><span className="meta">All posts</span><strong>{counts[0]?.count || 0}</strong></div><div className="stat"><span className="meta">Published</span><strong>{counts[1]?.count || 0}</strong></div><div className="stat"><span className="meta">Pending comments</span><strong>{counts[2]?.count || 0}</strong></div></div><section className="border" style={{padding:24,background:'#fff'}}><div style={{display:'flex',justifyContent:'space-between',gap:15,alignItems:'center'}}><h2 className="serif">Posts</h2><Link className="button" href="/admin/posts/new/">New post</Link></div>{posts.results.map((post)=><div className="post-row" key={post.id}><div><strong>{post.title}</strong><div className="meta">/{post.slug} · {post.status}</div></div><Link className="meta" href={`/${post.slug}/`}>View</Link><Link className="meta" href={`/admin/posts/${post.id}/edit/`}>Edit</Link></div>)}</section></main></div></div>
}
