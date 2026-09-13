import { requireAdmin } from '@/lib/admin'
import { db, getCategories } from '@/lib/db'
import ProPostEditor from '@/app/admin/components/ProPostEditor'

export default async function NewPostPage(){
 await requireAdmin(); const categories=await getCategories(); const tags=await db.prepare(`SELECT id,name FROM tags WHERE deleted_at IS NULL ORDER BY name`).all<{id:string;name:string}>()
 return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="kicker">Publishing</p>
          <h1>New post</h1>
          <p>Draft, format and publish a new journal article.</p>
        </div>
      </div>
      <ProPostEditor categories={categories} tags={tags.results} />
    </>
  )
}
