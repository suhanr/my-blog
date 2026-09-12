import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { db, getCategories } from '@/lib/db'
import PostEditor from '@/app/admin/components/PostEditor'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const post = await db.prepare(`SELECT id,title,slug,excerpt,content,content_format AS contentFormat,cover_image AS coverImage,status,seo_title AS seoTitle,seo_description AS seoDescription,seo_keywords AS seoKeywords,og_image AS ogImage,canonical_url AS canonicalUrl,noindex FROM posts WHERE id=? LIMIT 1`).bind(id).first<any>()
  if (!post) return <main className="admin-main"><h1 className="serif">Post not found</h1></main>
  const categories = await getCategories()
  const selected = await db.prepare(`SELECT category_id AS id FROM post_categories WHERE post_id=?`).bind(id).all<{ id: string }>()
  const tags = await db.prepare(`SELECT t.id,t.name FROM tags t JOIN post_tags pt ON pt.tag_id=t.id WHERE pt.post_id=? AND t.deleted_at IS NULL ORDER BY t.name`).bind(id).all<{ id: string; name: string }>()
  const allTags = await db.prepare(`SELECT id,name FROM tags WHERE deleted_at IS NULL ORDER BY name`).all<{ id: string; name: string }>()
  return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/taxonomy/">Categories & tags</Link><Link href="/admin/media/">Media</Link><Link href="/admin/comments/">Comments</Link><Link href="/admin/trash/">Trash</Link><Link href={`/${post.slug}/`}>View article ↗</Link></nav></aside><main className="admin-main"><p className="kicker">Publishing</p><h1 className="serif">Edit post</h1><PostEditor categories={categories} tags={allTags.results} initial={{ ...post, categoryIds: selected.results.map(x => x.id), tags: tags.results.map(x => x.name) }} /></main></div></div>
}
