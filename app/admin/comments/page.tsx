import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

export default async function CommentsPage() {
  await requireAdmin()
  const comments = await db.prepare(`SELECT c.id,c.name,c.email,c.body,c.status,c.created_at AS createdAt,p.title,p.slug FROM comments c JOIN posts p ON p.id=c.post_id ORDER BY datetime(c.created_at) DESC LIMIT 100`).all<any>()
  return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/comments/">Comments</Link></nav></aside><main className="admin-main"><p className="kicker">Moderation</p><h1 className="serif">Comments</h1>{comments.results.map((comment)=><article className="border" style={{padding:18,background:'#fff',margin:'12px 0'}} key={comment.id}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><strong>{comment.name}</strong><span className="meta">{comment.status}</span></div><p>{comment.body}</p><div className="meta">On <Link href={`/${comment.slug}/`}>{comment.title}</Link></div>{comment.status==='PENDING' ? <div style={{display:'flex',gap:15,marginTop:12}}><form action="/api/admin/comments" method="post"><input type="hidden" name="id" value={comment.id}/><input type="hidden" name="status" value="APPROVED"/><button className="button" type="submit">Approve</button></form><form action="/api/admin/comments" method="post"><input type="hidden" name="id" value={comment.id}/><input type="hidden" name="status" value="SPAM"/><button className="meta" type="submit">Spam</button></form></div> : null}</article>)}</main></div></div>
}
