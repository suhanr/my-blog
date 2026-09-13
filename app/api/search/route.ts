import { searchPublishedPosts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim().slice(0, 100)

  if (!q) {
    return Response.json({ ok: true, q: '', results: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const posts = await searchPublishedPosts(q, 12)
    return Response.json(
      {
        ok: true,
        q,
        results: posts.map((p: any) => ({
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
