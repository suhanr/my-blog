import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import AdminDashboardInteractive from '@/app/admin/components/AdminDashboardInteractive'

export default async function AdminDashboard() {
  await requireAdmin()

  const posts = await db.prepare(`
    SELECT id,title,slug,status,cover_image AS coverImage,updated_at AS updatedAt
    FROM posts
    WHERE deleted_at IS NULL
    ORDER BY datetime(updated_at) DESC
    LIMIT 100
  `).all<any>()

  const [all, published, drafts, comments, categories, tags, trash] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE status='PUBLISHED' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE status='DRAFT' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM comments WHERE status='PENDING' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM categories WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM tags WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM posts WHERE deleted_at IS NOT NULL`).first<any>(),
  ])

  return (
    <AdminDashboardInteractive
      posts={posts.results}
      counts={{
        all: Number(all?.count || 0),
        published: Number(published?.count || 0),
        drafts: Number(drafts?.count || 0),
        comments: Number(comments?.count || 0),
        categories: Number(categories?.count || 0),
        tags: Number(tags?.count || 0),
        trash: Number(trash?.count || 0),
      }}
    />
  )
}
