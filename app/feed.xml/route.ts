import { db } from '@/lib/db'
import { AUTHOR_NAME, SITE, SITE_NAME, DEFAULT_DESCRIPTION } from '@/lib/seo'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function asText(value: string | null | undefined) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await db.prepare(`
    SELECT title,slug,excerpt,published_at AS publishedAt,updated_at AS updatedAt
    FROM posts
    WHERE status='PUBLISHED'
      AND published_at IS NOT NULL
      AND deleted_at IS NULL
      AND (noindex IS NULL OR noindex=0)
    ORDER BY published_at DESC
    LIMIT 25
  `).all<{ title: string; slug: string; excerpt: string | null; publishedAt: string; updatedAt: string }>()

  const items = posts.results.map((post) => {
    const url = `${SITE}/${post.slug}/`
    const pubDate = new Date(post.publishedAt || post.updatedAt).toUTCString()
    const description = escapeXml(asText(post.excerpt))

    return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${escapeXml(url)}</link>
        <guid isPermaLink="true">${escapeXml(url)}</guid>
        <description>${description}</description>
        <pubDate>${pubDate}</pubDate>
        <author>${escapeXml(AUTHOR_NAME)}</author>
      </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(`${SITE}/`)}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>bn-BD</language>
    <generator>Suhanur Rahman Notes</generator>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
