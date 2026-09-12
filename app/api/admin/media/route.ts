import { env } from 'cloudflare:workers'
import { isAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  if (!(await isAdmin(request))) return new Response('Unauthorized', { status: 401 })
  const media = await db.prepare(`SELECT id,url,filename,mime_type AS mimeType,size,created_at AS createdAt FROM media_assets WHERE deleted_at IS NULL ORDER BY datetime(created_at) DESC`).all<{id:string;url:string;filename:string|null;mimeType:string|null;size:number|null;createdAt:string}>()
  return Response.json({ media: media.results })
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'File required' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: 'Maximum file size is 10MB' }, { status: 413 })
  const type = file.type || 'application/octet-stream'
  if (!type.startsWith('image/')) return Response.json({ error: 'Images only' }, { status: 415 })
  const ext = type.split('/')[1]?.replace('jpeg', 'jpg') || 'bin'
  const key = `media/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
  const url = `/media/${key.replace(/^media\//, '')}`
  const id = crypto.randomUUID()
  await env.BLOG_MEDIA.put(key, file.stream(), { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } })
  await db.prepare(`INSERT INTO media_assets (id,key,url,filename,mime_type,size,created_at) VALUES (?,?,?,?,?,?,?)`).bind(id, key, url, file.name || null, type, file.size, new Date().toISOString()).run()
  return Response.json({ url, key, id })
}
