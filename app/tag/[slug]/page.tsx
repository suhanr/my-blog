import type { Metadata } from 'next'
import Link from 'next/link'
import { getTagBySlug } from '@/lib/db'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getTagBySlug(slug)
  return data ? { title: `#${data.tag.name}`, description: `Articles tagged ${data.tag.name} by Suhanur Rahman.`, alternates: { canonical: `https://blog.suhanurrahman.com/tag/${slug}/` } } : { title: 'Tag not found' }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getTagBySlug(slug)
  if (!data) return <main className="container article-shell"><h1 className="serif">Tag not found</h1></main>
  return <main><header className="header"><div className="container header-inner"><Link className="brand" href="/">SUHANUR RAHMAN / JOURNAL</Link><nav className="nav"><Link href="/">Journal</Link><a href="https://suhanurrahman.com/">Portfolio ↗</a></nav></div></header><div className="container article-shell"><p className="kicker">Tag</p><h1 className="serif" style={{fontSize:'clamp(3rem,7vw,6.5rem)',lineHeight:.95,margin:'15px 0 45px'}}>#{data.tag.name}</h1><div className="grid">{data.posts.map((post:any)=><article className="card border" key={post.id}>{post.coverImage ? <img src={post.coverImage} alt={post.title} loading="lazy"/>:null}<div className="card-body"><h2><Link href={`/${post.slug}/`}>{post.title}</Link></h2><p className="muted">{post.excerpt || ''}</p><span className="meta">Read ↗</span></div></article>)}</div></div></main>
}
