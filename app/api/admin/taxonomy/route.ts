import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { slugify } from '@/lib/slug'

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return new Response('Unauthorized', { status: 401 })
  const form = await request.formData()
  const type = String(form.get('type') || '')
  const name = String(form.get('name') || '').trim().slice(0, 100)
  if (!name || !['category','tag'].includes(type)) return new Response('Invalid request', { status: 400 })
  const slug = slugify(name)
  const id = `${type === 'category' ? 'cat' : 'tag'}-${slug}`
  if (type === 'category') await db.prepare(`INSERT OR IGNORE INTO categories (id,name,slug) VALUES (?,?,?)`).bind(id,name,slug).run()
  else await db.prepare(`INSERT OR IGNORE INTO tags (id,name,slug) VALUES (?,?,?)`).bind(id,name,slug).run()
  return Response.redirect(new URL('/admin/taxonomy/', request.url), 303)
}
