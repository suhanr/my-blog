import { requireAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import AdminDashboardInteractive from '@/app/admin/components/AdminDashboardInteractive'

export default async function AdminDashboard() {
  await requireAdmin()

  const posts = await db.prepare(`
    SELECT id,title,slug,status,cover_image AS coverImage,updated_at AS updatedAt
    FROM posts
    WHERE deleted_at IS NULL
    ORDER BY updated_at DESC
    LIMIT 24
  `).all<any>()

  const [postCounts, comments, categories, tags] = await Promise.all([
    db.prepare(`
      SELECT
        COUNT(*) AS allCount,
        SUM(CASE WHEN status='PUBLISHED' THEN 1 ELSE 0 END) AS publishedCount,
        SUM(CASE WHEN status='DRAFT' THEN 1 ELSE 0 END) AS draftsCount,
        SUM(CASE WHEN deleted_at IS NOT NULL THEN 1 ELSE 0 END) AS trashCount
      FROM posts
    `).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM comments WHERE status='PENDING' AND deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM categories WHERE deleted_at IS NULL`).first<any>(),
    db.prepare(`SELECT COUNT(*) AS count FROM tags WHERE deleted_at IS NULL`).first<any>(),
  ])

  return (
    <AdminDashboardInteractive
      posts={posts.results}
      counts={{
        all: Number(postCounts?.allCount || 0),
        published: Number(postCounts?.publishedCount || 0),
        drafts: Number(postCounts?.draftsCount || 0),
        comments: Number(comments?.count || 0),
        categories: Number(categories?.count || 0),
        tags: Number(tags?.count || 0),
        trash: Number(postCounts?.trashCount || 0),
      }}
    />
  )
}
