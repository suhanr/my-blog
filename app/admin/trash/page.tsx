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
 const Section=({title,type,items}:{title:string;type:string;items:any[]})=><section className="border" style={{padding:20,marginBottom:18}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><h2>{title}</h2><span className="admin-status-pill is-draft">{items.length}</span></div>{items.length?items.map(x=><div className="trash-card" key={x.id}><div><strong>{x.title||x.name||x.filename||'Item'}</strong><div className="meta">{x.slug||x.body?.slice(0,80)||x.url||''}</div></div><form action="/api/admin/trash" method="post"><input type="hidden" name="type" value={type}/><input type="hidden" name="id" value={x.id}/><input type="hidden" name="action" value="restore"/><button className="button" type="submit">Restore</button></form></div>):<p className="muted" style={{margin:'12px 0 0'}}>Trash is empty.</p>}</section>
 return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="kicker">Recycle bin</p>
          <h1>Trash</h1>
          <p>Items are soft-deleted so they can be restored without damaging migrated content.</p>
        </div>
      </div>
      {Section({title:'Posts',type:'post',items:posts.results})}
      {Section({title:'Comments',type:'comment',items:comments.results})}
      {Section({title:'Categories',type:'category',items:categories.results})}
      {Section({title:'Tags',type:'tag',items:tags.results})}
      {Section({title:'Media',type:'media',items:media.results})}
    </>
  )
}
