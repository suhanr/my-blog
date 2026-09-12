import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'

export default async function TaxonomyPage() {
  await requireAdmin()
  const categories = await db.prepare(`SELECT id,name,slug FROM categories ORDER BY name`).all<any>()
  const tags = await db.prepare(`SELECT id,name,slug FROM tags ORDER BY name LIMIT 100`).all<any>()
  return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/media/">Media</Link><Link href="/admin/taxonomy/">Categories & tags</Link><Link href="/admin/comments/">Comments</Link></nav></aside><main className="admin-main"><p className="kicker">Taxonomy</p><h1 className="serif">Categories & tags</h1><div className="form-row" style={{marginTop:25}}><form className="admin-form" action="/api/admin/taxonomy" method="post"><input type="hidden" name="type" value="category"/><label>New category<input name="name" required/></label><button className="button" type="submit">Create category</button></form><section className="border" style={{padding:24,background:'#fff'}}><h2 className="serif">Categories</h2>{categories.results.map((item:any)=><p className="meta" key={item.id}>{item.name} · /category/{item.slug}/</p>)}</section></div><section className="border" style={{padding:24,background:'#fff',marginTop:20}}><h2 className="serif">Tags</h2><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{tags.results.map((item:any)=><span className="tag" key={item.id}>{item.name}</span>)}</div></section></main></div></div>
}
