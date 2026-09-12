import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return new Response('Unauthorized', { status: 401 })
  const form = await request.formData()
  const type = String(form.get('type') || '')
  const intent = String(form.get('intent') || 'create')
  const name = String(form.get('name') || '').trim().slice(0, 100)
  const id = String(form.get('id') || '')

  if (!['category', 'tag'].includes(type)) return new Response('Invalid taxonomy type', { status: 400 })
  const table = type === 'category' ? 'categories' : 'tags'
  const prefix = type === 'category' ? 'cat' : 'tag'

  if (intent === 'delete') {
    if (!id) return new Response('Taxonomy id is required', { status: 400 })
    await db.prepare(`DELETE FROM ${table} WHERE id=?`).bind(id).run()
    return Response.redirect(new URL('/admin/taxonomy/', request.url), 303)
  }

  if (!name) return new Response('Name is required', { status: 400 })
  const slug = slugify(String(form.get('slug') || name))

  if (intent === 'update') {
    if (!id) return new Response('Taxonomy id is required', { status: 400 })
    await db.prepare(`UPDATE ${table} SET name=?, slug=? WHERE id=?`).bind(name, slug, id).run()
  } else {
    const newId = `${prefix}-${slug}`
    await db.prepare(`INSERT INTO ${table} (id,name,slug) VALUES (?,?,?)`).bind(newId, name, slug).run()
  }

  return Response.redirect(new URL('/admin/taxonomy/', request.url), 303)
}
