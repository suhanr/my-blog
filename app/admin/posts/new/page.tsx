import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db, getCategories } from '@/lib/db'
import ProPostEditor from '@/app/admin/components/ProPostEditor'

export default async function NewPostPage(){
 await requireAdmin(); const categories=await getCategories(); const tags=await db.prepare(`SELECT id,name FROM tags WHERE deleted_at IS NULL ORDER BY name`).all<{id:string;name:string}>()
 return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/taxonomy/">Categories & tags</Link><Link href="/admin/media/">Media</Link><Link href="/admin/comments/">Comments</Link><Link href="/admin/trash/">Trash</Link></nav></aside><main className="admin-main"><p className="kicker">Publishing</p><h1 className="serif">New post</h1><ProPostEditor categories={categories} tags={tags.results}/></main></div></div>
}
