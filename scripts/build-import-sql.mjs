import fs from 'node:fs/promises'

const input = JSON.parse(await fs.readFile('migration-data/wordpress.json', 'utf8'))
const esc = (value) => value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`
const slug = (value) => String(value || '').toLowerCase().trim().replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-+|-+$/g, '')
const mediaUrl = (value) => String(value || '')
  .replaceAll('https://blog.suhanurrahman.com/wp-content/uploads/', 'https://blog.suhanurrahman.com/media/uploads/')
  .replaceAll('http://blog.suhanurrahman.com/wp-content/uploads/', 'https://blog.suhanurrahman.com/media/uploads/')
const lines = []

for (const category of input.categories) {
  lines.push(`INSERT OR IGNORE INTO categories (id,name,slug) VALUES (${esc(`wp-cat-${category.id}`)},${esc(category.name)},${esc(category.slug || slug(category.name))});`)
}
for (const tag of input.tags) {
  lines.push(`INSERT OR IGNORE INTO tags (id,name,slug) VALUES (${esc(`wp-tag-${tag.id}`)},${esc(tag.name)},${esc(tag.slug || slug(tag.name))});`)
}
for (const post of input.posts) {
  const categoryId = post.categoryIds?.[0] ? `wp-cat-${post.categoryIds[0]}` : null
  const status = post.status === 'publish' ? 'PUBLISHED' : 'DRAFT'
  lines.push(`INSERT OR REPLACE INTO posts (id,title,slug,excerpt,content,cover_image,status,published_at,created_at,updated_at,category_id) VALUES (${esc(post.id)},${esc(post.title)},${esc(post.slug)},${esc(post.excerpt)},${esc(mediaUrl(post.contentHtml))},${esc(mediaUrl(post.featuredImage))},${esc(status)},${esc(status === 'PUBLISHED' ? post.date : null)},${esc(post.date)},${esc(post.modified || post.date)},${esc(categoryId)});`)
  for (const tagId of post.tagIds || []) {
    lines.push(`INSERT OR IGNORE INTO post_tags (post_id,tag_id) VALUES (${esc(post.id)},${esc(`wp-tag-${tagId}`)});`)
  }
}
for (const comment of input.comments || []) {
  lines.push(`INSERT OR REPLACE INTO comments (id,post_id,name,email,body,status,created_at) VALUES (${esc(comment.id)},${esc(comment.postId)},${esc(comment.name)},${esc(comment.email)},${esc(comment.body)},${esc(comment.status)},${esc(comment.createdAt)});`)
}

await fs.writeFile('migration-data/import.sql', lines.join('\n') + '\n')
console.log(`Generated ${lines.length} SQL statements.`)
