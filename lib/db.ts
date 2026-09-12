import type { Post, Category, Tag } from './types'
import { env } from 'cloudflare:workers'

type BlogEnv = typeof env & { BLOG_DB: D1Database }
const db = (env as BlogEnv).BLOG_DB

const postSelect = `p.id,p.title,p.slug,p.excerpt,p.content,p.content_format AS contentFormat,p.cover_image AS coverImage,p.status,p.published_at AS publishedAt,p.created_at AS createdAt,p.updated_at AS updatedAt,p.category_id AS categoryId,p.seo_title AS seoTitle,p.seo_description AS seoDescription,p.seo_keywords AS seoKeywords,p.og_image AS ogImage,p.canonical_url AS canonicalUrl,p.noindex`

export async function listPublishedPosts(limit = 20): Promise<Post[]> {
  const result = await db.prepare(`SELECT ${postSelect}, c.name AS categoryName,c.slug AS categorySlug FROM posts p LEFT JOIN categories c ON c.id=p.category_id WHERE p.status='PUBLISHED' AND p.published_at IS NOT NULL AND p.deleted_at IS NULL AND (c.deleted_at IS NULL OR c.id IS NULL) ORDER BY datetime(p.published_at) DESC LIMIT ?`).bind(limit).all<Post>()
  return result.results
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return await db.prepare(`SELECT ${postSelect},c.name AS categoryName,c.slug AS categorySlug FROM posts p LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=? AND p.status='PUBLISHED' AND p.deleted_at IS NULL LIMIT 1`).bind(slug).first<Post>()
}

export async function getCategories(): Promise<Category[]> {
  const result = await db.prepare(`SELECT id,name,slug FROM categories WHERE deleted_at IS NULL ORDER BY name`).all<Category>()
  return result.results
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.prepare(`SELECT id,name,slug FROM categories WHERE slug=? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Category>()
  if (!category) return null
  const posts = await db.prepare(`SELECT ${postSelect},c.name AS categoryName,c.slug AS categorySlug FROM posts p JOIN categories c ON c.id=p.category_id WHERE c.slug=? AND c.deleted_at IS NULL AND p.status='PUBLISHED' AND p.deleted_at IS NULL ORDER BY datetime(p.published_at) DESC`).bind(slug).all<Post>()
  return { category, posts: posts.results }
}

export async function getTagBySlug(slug: string) {
  const tag = await db.prepare(`SELECT id,name,slug FROM tags WHERE slug=? AND deleted_at IS NULL LIMIT 1`).bind(slug).first<Tag>()
  if (!tag) return null
  const posts = await db.prepare(`SELECT ${postSelect},c.name AS categoryName,c.slug AS categorySlug FROM posts p JOIN post_tags pt ON pt.post_id=p.id JOIN tags t ON t.id=pt.tag_id LEFT JOIN categories c ON c.id=p.category_id WHERE t.slug=? AND t.deleted_at IS NULL AND p.status='PUBLISHED' AND p.deleted_at IS NULL ORDER BY datetime(p.published_at) DESC`).bind(slug).all<Post>()
  return { tag, posts: posts.results }
}

export async function getComments(postId: string) {
  const result = await db.prepare(`SELECT id,name,body,created_at AS createdAt FROM comments WHERE post_id=? AND status='APPROVED' AND deleted_at IS NULL ORDER BY datetime(created_at) ASC`).bind(postId).all<{id:string;name:string;body:string;createdAt:string}>()
  return result.results
}

export { db }
