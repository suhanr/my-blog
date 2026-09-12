import fs from 'node:fs/promises'

const base = (process.env.WP_URL || 'https://blog.suhanurrahman.com').replace(/\/$/, '')
const perPage = 100

async function fetchAll(resource, query = '') {
  const rows = []
  let page = 1
  while (true) {
    const separator = query ? '&' : ''
    const response = await fetch(`${base}/wp-json/wp/v2/${resource}?per_page=${perPage}&page=${page}${separator}${query}`)
    if (response.status === 400) break
    if (!response.ok) throw new Error(`WordPress API ${response.status}: ${resource}`)
    const data = await response.json()
    rows.push(...data)
    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1)
    if (page >= totalPages) break
    page += 1
  }
  return rows
}

const posts = await fetchAll('posts', 'context=view&_embed=1')
const categories = await fetchAll('categories')
const tags = await fetchAll('tags')
const comments = await fetchAll('comments', 'context=embed&orderby=date&order=asc')

const normalized = posts.map((post) => ({
  id: `wp-${post.id}`,
  wpId: post.id,
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

const normalizedComments = comments.map((comment) => ({
  id: `wp-comment-${comment.id}`,
  postId: `wp-${comment.post}`,
  name: comment.author_name || 'Anonymous',
  email: null,
  body: (comment.content?.rendered || '').replace(/<[^>]+>/g, '').trim(),
  status: comment.status === 'approved' ? 'APPROVED' : comment.status === 'spam' ? 'SPAM' : comment.status === 'trash' ? 'TRASH' : 'PENDING',
  createdAt: comment.date_gmt || comment.date,
}))

await fs.mkdir('migration-data', { recursive: true })
await fs.writeFile('migration-data/wordpress.json', JSON.stringify({ source: base, exportedAt: new Date().toISOString(), posts: normalized, categories, tags, comments: normalizedComments }, null, 2))
console.log(`Exported ${normalized.length} posts, ${categories.length} categories, ${tags.length} tags and ${normalizedComments.length} comments.`)
