import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const SITE = 'https://blog.suhanurrahman.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.prepare(`SELECT slug, updated_at AS updatedAt FROM posts WHERE status='PUBLISHED'`).all<{slug:string;updatedAt:string}>()
  const categories = await db.prepare(`SELECT slug FROM categories`).all<{slug:string}>()
  const tags = await db.prepare(`SELECT slug FROM tags`).all<{slug:string}>()
  return [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...posts.results.map((p) => ({ url: `${SITE}/${p.slug}/`, lastModified: new Date(p.updatedAt), changeFrequency: 'weekly' as const, priority: 0.9 })),
    ...categories.results.map((c) => ({ url: `${SITE}/category/${c.slug}/`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...tags.results.map((t) => ({ url: `${SITE}/tag/${t.slug}/`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 })),
  ]
}
