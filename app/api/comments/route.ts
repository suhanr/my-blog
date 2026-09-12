import { db } from '@/lib/db'

export async function POST(request: Request) {
  const form = await request.formData()
  const postId = String(form.get('postId') || '').trim()
  const name = String(form.get('name') || '').trim().slice(0, 80)
  const email = String(form.get('email') || '').trim().slice(0, 160)
  const body = String(form.get('body') || '').trim().slice(0, 5000)
  if (!postId || !name || !body) return new Response('Missing required fields', { status: 400 })

  const id = crypto.randomUUID()
  await db.prepare(`INSERT INTO comments (id, post_id, name, email, body, status, created_at) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`)
    .bind(id, postId, name, email || null, body, new Date().toISOString()).run()

  return Response.redirect(new URL(request.headers.get('referer') || '/', request.url), 303)
}
