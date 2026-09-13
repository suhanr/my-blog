import { searchPublishedPosts } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').slice(0, 100)
  const posts = await searchPublishedPosts(q, 12)
  return Response.json({
    q,
    results: posts.map((p: any) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      categoryName: p.categoryName,
      publishedAt: p.publishedAt,
    })),
  })
}
