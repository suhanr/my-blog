import type { Post, Category, Tag } from './types'
import { env } from 'cloudflare:workers'

type BlogEnv = typeof env & { BLOG_DB: D1Database }
const db = (env as BlogEnv).BLOG_DB

const postSelect = `p.id,p.title,p.slug,p.excerpt,p.content,p.content_format AS contentFormat,p.cover_image AS coverImage,p.status,p.published_at AS publishedAt,p.created_at AS createdAt,p.updated_at AS updatedAt,p.category_id AS categoryId,p.seo_title AS seoTitle,p.seo_description AS seoDescription,p.seo_keywords AS seoKeywords,p.og_image AS ogImage,p.canonical_url AS canonicalUrl,p.noindex`

// Lean column set for list/card views. These never render the article body or
// SEO metadata, so we avoid pulling the (potentially large) `content` column
// and unused SEO fields out of D1 — less data over the wire and less Worker
// CPU per request. Only `getPostBySlug` (the article page) needs `postSelect`.
const cardSelect = `p.id,p.title,p.slug,p.excerpt,p.cover_image AS coverImage,p.published_at AS publishedAt,p.category_id AS categoryId`

export type HeaderMenuItem = {
  id: string
  categoryId: string
  name: string
  slug: string
  parentId: string | null
  sortOrder: number
  children: HeaderMenuItem[]
}

export async function listPublishedPosts(limit = 20, offset = 0): Promise<Post[]> {
  const result = await db.prepare(`SELECT ${cardSelect}, c.name AS categoryName,c.slug AS categorySlug FROM posts p LEFT JOIN categories c ON c.id=p.category_id AND c.deleted_at IS NULL WHERE p.status='PUBLISHED' AND p.published_at IS NOT NULL AND p.deleted_at IS NULL ORDER BY p.published_at DESC LIMIT ? OFFSET ?`).bind(limit, offset).all<Post>()
  return result.results
}

export async function listTechnologyPosts(limit = 6): Promise<Post[]> {
  const result = await db.prepare(`SELECT ${cardSelect}, c.name AS categoryName,c.slug AS categorySlug FROM posts p JOIN categories c ON c.id=p.category_id WHERE c.deleted_at IS NULL AND (c.slug IN ('technology','tech-gossip') OR c.name IN ('প্রযুক্তি কথন','Technology')) AND p.status='PUBLISHED' AND p.published_at IS NOT NULL AND p.deleted_at IS NULL ORDER BY p.published_at DESC LIMIT ?`).bind(limit).all<Post>()
  return result.results
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return await db.prepare(`SELECT ${postSelect},c.name AS categoryName,c.slug AS categorySlug FROM posts p LEFT JOIN categories c ON c.id=p.category_id AND c.deleted_at IS NULL WHERE p.slug=? AND p.status='PUBLISHED' AND p.deleted_at IS NULL LIMIT 1`).bind(slug).first<Post>()
}

export async function getCategories(): Promise<Category[]> {
  const result = await db.prepare(`SELECT id,name,slug FROM categories WHERE deleted_at IS NULL ORDER BY name`).all<Category>()
  return result.results
}

export async function getHeaderMenu(): Promise<HeaderMenuItem[]> {
  try {
    const result = await db.prepare(`SELECT m.id,m.category_id AS categoryId,c.name,c.slug,m.parent_id AS parentId,m.sort_order AS sortOrder FROM header_menu_items m JOIN categories c ON c.id=m.category_id AND c.deleted_at IS NULL ORDER BY CASE WHEN m.parent_id IS NULL THEN 0 ELSE 1 END,m.parent_id,m.sort_order,m.id`).all<Omit<HeaderMenuItem, 'children'>>()
    const rows = result.results
    if (!rows.length) return []

    const nodes = new Map<string, HeaderMenuItem>()
    for (const row of rows) nodes.set(row.id, { ...row, children: [] })
    const roots: HeaderMenuItem[] = []
    for (const node of nodes.values()) {
      if (node.parentId && nodes.has(node.parentId)) nodes.get(node.parentId)!.children.push(node)
      else roots.push(node)
    }
    return roots
  } catch {
    return (await getCategories()).slice(0, 7).map((category, index) => ({
      id: `fallback-${category.id}`,
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
      parentId: null,
      sortOrder: index,
      children: [],
    }))
  }
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.prepare(`SELECT id,name,slug FROM categories WHERE slug=? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Category>()
  if (!category) return null
  const posts = await db.prepare(`SELECT ${cardSelect},c.name AS categoryName,c.slug AS categorySlug FROM posts p JOIN categories c ON c.id=p.category_id WHERE c.slug=? AND c.deleted_at IS NULL AND p.status='PUBLISHED' AND p.deleted_at IS NULL ORDER BY p.published_at DESC`).bind(slug).all<Post>()
  return { category, posts: posts.results }
}

export async function getTagBySlug(slug: string) {
  const tag = await db.prepare(`SELECT id,name,slug FROM tags WHERE slug=? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Tag>()
  if (!tag) return null
  const posts = await db.prepare(`SELECT ${cardSelect},c.name AS categoryName,c.slug AS categorySlug FROM posts p JOIN post_tags pt ON pt.post_id=p.id JOIN tags t ON t.id=pt.tag_id LEFT JOIN categories c ON c.id=p.category_id AND c.deleted_at IS NULL WHERE t.slug=? AND t.deleted_at IS NULL AND p.status='PUBLISHED' AND p.deleted_at IS NULL ORDER BY p.published_at DESC`).bind(slug).all<Post>()
  return { tag, posts: posts.results }
}

export type PublicComment = {
  id: string
  name: string
  body: string
  createdAt: string
  parentCommentId: string | null
}

export async function getComments(postId: string): Promise<PublicComment[]> {
  const result = await db.prepare(`SELECT id,name,body,created_at AS createdAt,parent_comment_id AS parentCommentId FROM comments WHERE post_id=? AND status='APPROVED' AND deleted_at IS NULL ORDER BY created_at ASC`).bind(postId).all<PublicComment>()
  return result.results
}

export { db }
