import { env } from 'cloudflare:workers'
import { isAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  if (!(await isAdmin(request))) return new Response('Unauthorized', { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return new Response('File required', { status: 400 })
  if (file.size > 10 * 1024 * 1024) return new Response('Maximum file size is 10MB', { status: 413 })
  const type = file.type || 'application/octet-stream'
  if (!type.startsWith('image/')) return new Response('Images only', { status: 415 })
  const ext = type.split('/')[1]?.replace('jpeg', 'jpg') || 'bin'
  const key = `media/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`
  await env.BLOG_MEDIA.put(key, file.stream(), { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } })
  return Response.json({ url: `/media/${key.replace(/^media\//, '')}`, key })
}
