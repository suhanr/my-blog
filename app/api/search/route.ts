import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function escapeLike(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100)

  if (q.length < 2) {
    return Response.json(
      { ok: true, q, results: [] },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const terms = q
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map(escapeLike)

    if (!terms.length) {
      return Response.json(
        { ok: true, q, results: [] },
        { headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const fields = [
      "p.title",
      "COALESCE(p.excerpt, '')",
      "p.slug",
      "COALESCE(p.content, '')",
      "COALESCE(c.name, '')",
      "COALESCE(c.slug, '')",
    ]

    const conditions = terms.map(() => `(${fields.map((field) => `${field} LIKE ? ESCAPE '\\'`).join(' OR ')})`)
    const likeValues = terms.flatMap((term) => {
      const value = `%${term}%`
      return fields.map(() => value)
    })

    const sql = `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.cover_image AS coverImage,
        p.published_at AS publishedAt,
        c.name AS categoryName,
        c.slug AS categorySlug
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id AND c.deleted_at IS NULL
      WHERE p.status = 'PUBLISHED'
        AND p.published_at IS NOT NULL
        AND p.deleted_at IS NULL
        AND ${conditions.join(' AND ')}
      ORDER BY datetime(p.published_at) DESC
      LIMIT 12
    `

    const posts = await db.prepare(sql).bind(...likeValues).all()

    return Response.json(
      {
        ok: true,
        q,
        results: (posts.results || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          coverImage: p.coverImage,
          categoryName: p.categoryName,
          publishedAt: p.publishedAt,
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('public search failed', error)
    return Response.json(
      { ok: false, q, results: [], error: 'Search is temporarily unavailable.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
