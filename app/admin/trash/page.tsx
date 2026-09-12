import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

export default async function TrashPage(){
 await requireAdmin(); const [posts,comments,categories,tags,media]=await Promise.all([
  db.prepare(`SELECT id,title,slug,deleted_at AS deletedAt FROM posts WHERE deleted_at IS NOT NULL ORDER BY datetime(deleted_at) DESC`).all<any>(),
  db.prepare(`SELECT id,name,body,deleted_at AS deletedAt FROM comments WHERE deleted_at IS NOT NULL ORDER BY datetime(deleted_at) DESC`).all<any>(),
  db.prepare(`SELECT id,name,slug,deleted_at AS deletedAt FROM categories WHERE deleted_at IS NOT NULL ORDER BY datetime(deleted_at) DESC`).all<any>(),
  db.prepare(`SELECT id,name,slug,deleted_at AS deletedAt FROM tags WHERE deleted_at IS NOT NULL ORDER BY datetime(deleted_at) DESC`).all<any>(),
  db.prepare(`SELECT id,filename,url,deleted_at AS deletedAt FROM media_assets WHERE deleted_at IS NOT NULL ORDER BY datetime(deleted_at) DESC`).all<any>()
 ])
 const Section=({title,type,items}:{title:string;type:string;items:any[]})=><section className="border" style={{padding:20,background:'#fff',borderRadius:12,marginBottom:18}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><h2 className="serif">{title}</h2><span className="meta">{items.length}</span></div>{items.length?items.map(x=><div className="trash-card" key={x.id}><div><strong>{x.title||x.name||x.filename||'Item'}</strong><div className="meta">{x.slug||x.body?.slice(0,80)||x.url||''}</div></div><form action="/api/admin/trash" method="post"><input type="hidden" name="type" value={type}/><input type="hidden" name="id" value={x.id}/><input type="hidden" name="action" value="restore"/><button className="button" type="submit">Restore</button></form></div>):<p className="muted">Trash is empty.</p>}</section>
 return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/taxonomy/">Categories & tags</Link><Link href="/admin/media/">Media</Link><Link href="/admin/comments/">Comments</Link><Link href="/admin/trash/">Trash</Link></nav></aside><main className="admin-main"><p className="kicker">Recycle bin</p><h1 className="serif">Trash</h1><p className="muted">Items are soft-deleted so they can be restored without damaging migrated content.</p>{Section({title:'Posts',type:'post',items:posts.results})}{Section({title:'Comments',type:'comment',items:comments.results})}{Section({title:'Categories',type:'category',items:categories.results})}{Section({title:'Tags',type:'tag',items:tags.results})}{Section({title:'Media',type:'media',items:media.results})}</main></div></div>
}
