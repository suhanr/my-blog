import fs from 'node:fs/promises'

const base = (process.env.WP_URL || 'https://blog.suhanurrahman.com').replace(/\/$/, '')
const perPage = 100

async function fetchAll(path) {
  const rows = []
  let page = 1
  while (true) {
    const response = await fetch(`${base}/wp-json/wp/v2/${path}?per_page=${perPage}&page=${page}`)
    if (response.status === 400) break
    if (!response.ok) throw new Error(`WordPress API ${response.status}: ${path}`)
    const data = await response.json()
    rows.push(...data)
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1)
    if (page >= totalPages) break
    page += 1
  }
  return rows
}

const posts = await fetchAll('posts&context=view&_embed=1')
const categories = await fetchAll('categories')
const tags = await fetchAll('tags')

const normalized = posts.map((post) => ({
  id: `wp-${post.id}`,
  title: post.title?.rendered || '',
  slug: post.slug,
  excerpt: (post.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim(),
  contentHtml: post.content?.rendered || '',
  date: post.date_gmt || post.date,
  modified: post.modified_gmt || post.modified,
  status: post.status,
  featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
  categoryIds: post.categories || [],
  tagIds: post.tags || [],
}))

await fs.mkdir('migration-data', { recursive: true })
await fs.writeFile('migration-data/wordpress.json', JSON.stringify({ source: base, exportedAt: new Date().toISOString(), posts: normalized, categories, tags }, null, 2))
console.log(`Exported ${normalized.length} posts, ${categories.length} categories and ${tags.length} tags.`)
