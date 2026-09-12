export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  categoryId: string | null
  categoryName?: string | null
  categorySlug?: string | null
}

export type Category = { id: string; name: string; slug: string }
export type Tag = { id: string; name: string; slug: string }
