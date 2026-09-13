import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
export default async function CommentsPage(){await requireAdmin();const comments=await db.prepare(`SELECT c.id,c.name,c.email,c.body,c.status,c.created_at AS createdAt,p.title,p.slug FROM comments c JOIN posts p ON p.id=c.post_id WHERE c.deleted_at IS NULL ORDER BY datetime(c.created_at) DESC LIMIT 100`).all<any>();return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="kicker">Moderation</p>
          <h1>Comments</h1>
          <p>Approve, hold or remove reader comments across your journal.</p>
        </div>
      </div>
      {comments.results.length ? comments.results.map((c:any)=>(
        <article className="border" style={{padding:18,margin:'0 0 14px'}} key={c.id}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
            <strong>{c.name}</strong>
            <span className={`admin-status-pill ${c.status==='APPROVED'?'is-published':'is-draft'}`}>{c.status}</span>
          </div>
          <p style={{margin:'10px 0',lineHeight:1.6}}>{c.body}</p>
          <div className="meta">On <Link href={`/${c.slug}/`} style={{color:'var(--accent)'}}>{c.title}</Link></div>
          <div style={{display:'flex',gap:8,marginTop:14,flexWrap:'wrap'}}>{['APPROVED','PENDING','SPAM','TRASH'].map(s=><form key={s} action="/api/admin/comments" method="post"><input type="hidden" name="id" value={c.id}/><input type="hidden" name="status" value={s}/><button className={s==='APPROVED'?'button':s==='TRASH'?'danger-button':'meta'} type="submit">{s==='APPROVED'?'Approve':s==='PENDING'?'Pending':s==='SPAM'?'Spam':'Trash'}</button></form>)}</div>
        </article>
      )):<div className="admin-empty-state"><strong>No comments yet</strong><span>Reader comments will appear here for moderation.</span></div>}
    </>
  )}
