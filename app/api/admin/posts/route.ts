import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return new Response('Unauthorized', { status: 401 })
  const form = await request.formData()
  const intent = String(form.get('intent') || 'create')
  const id = String(form.get('id') || crypto.randomUUID())

  if (intent === 'delete') {
    await db.prepare(`DELETE FROM posts WHERE id=?`).bind(id).run()
    return Response.redirect(new URL('/admin/', request.url), 303)
  }

  const title = String(form.get('title') || '').trim().slice(0, 240)
  const slug = slugify(String(form.get('slug') || title))
  const excerpt = String(form.get('excerpt') || '').trim().slice(0, 500)
  const content = String(form.get('content') || '')
  const coverImage = String(form.get('coverImage') || '').trim().slice(0, 500)
  const categoryId = String(form.get('categoryId') || '').trim() || null
  const status = String(form.get('status') || 'DRAFT') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  const now = new Date().toISOString()

  if (!title || !content) return new Response('Title and content are required', { status: 400 })

  if (intent === 'update') {
    await db.prepare(`UPDATE posts SET title=?, slug=?, excerpt=?, content=?, cover_image=?, status=?, published_at=CASE WHEN ?='PUBLISHED' THEN COALESCE(published_at, ?) ELSE NULL END, updated_at=?, category_id=? WHERE id=?`)
      .bind(title, slug, excerpt || null, content, coverImage || null, status, status, now, now, categoryId, id).run()
  } else {
    await db.prepare(`INSERT INTO posts (id,title,slug,excerpt,content,cover_image,status,published_at,created_at,updated_at,category_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, title, slug, excerpt || null, content, coverImage || null, status, status === 'PUBLISHED' ? now : null, now, now, categoryId).run()
  }

  const tags = String(form.get('tags') || '').split(',').map((v) => v.trim()).filter(Boolean).slice(0, 20)
  await db.prepare(`DELETE FROM post_tags WHERE post_id=?`).bind(id).run()
  for (const tagName of tags) {
    const tagSlug = slugify(tagName)
    const tagId = `tag-${tagSlug}`
    await db.prepare(`INSERT OR IGNORE INTO tags (id,name,slug) VALUES (?,?,?)`).bind(tagId, tagName, tagSlug).run()
    await db.prepare(`INSERT OR IGNORE INTO post_tags (post_id,tag_id) VALUES (?,?)`).bind(id, tagId).run()
  }

  return Response.redirect(new URL(`/admin/posts/${id}/edit/`, request.url), 303)
}
