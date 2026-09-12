import fs from 'node:fs/promises'
import https from 'node:https'
import { URL } from 'node:url'

const base = (process.env.WP_URL || 'https://blog.suhanurrahman.com').replace(/\/$/, '')
const host = new URL(base).hostname
const legacyIp = process.env.LEGACY_WP_IP
const perPage = 100

function lookupLegacy(_hostname, options, callback) {
  if (!legacyIp) return callback(null, undefined, 4)
  if (options?.all) return callback(null, [{ address: legacyIp, family: 4 }])
  return callback(null, legacyIp, 4)
}

function legacyGet(pathname) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: host,
      port: 443,
      path: pathname,
      method: 'GET',
      servername: host,
      headers: { Host: host, Accept: 'application/json' },
      ...(legacyIp ? { lookup: lookupLegacy } : {}),
    }, (response) => {
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve({ status: response.statusCode || 0, headers: response.headers, body: Buffer.concat(chunks) }))
    })
    request.on('error', reject)
    request.end()
  })
}

async function fetchJson(pathname) {
  const response = await legacyGet(pathname)
  if (response.status >= 300 && response.status < 400 && response.headers.location) {
    const location = new URL(response.headers.location, base)
    return fetchJson(`${location.pathname}${location.search}`)
  }
  if (response.status !== 200) throw new Error(`WordPress API ${response.status}: ${pathname}`)
  return { data: JSON.parse(response.body.toString('utf8')), headers: response.headers }
}

async function fetchAll(resource, query = '') {
  const rows = []
  let page = 1
  while (true) {
    const params = new URLSearchParams({ per_page: String(perPage), page: String(page) })
    if (query) for (const [key, value] of new URLSearchParams(query)) params.set(key, value)
    const result = await fetchJson(`/wp-json/wp/v2/${resource}?${params.toString()}`)
    if (!Array.isArray(result.data)) throw new Error(`Unexpected WordPress response for ${resource}`)
    rows.push(...result.data)
    const totalPages = Number(result.headers['x-wp-totalpages'] || 1)
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
