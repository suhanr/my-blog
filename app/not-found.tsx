import Link from 'next/link'

export default function NotFound() {
  return <main className="container article-shell"><p className="kicker">404</p><h1 className="serif" style={{fontSize:'clamp(3rem,7vw,6rem)',lineHeight:.95}}>This page does not exist.</h1><p className="article-excerpt">The article may have moved, been unpublished or never existed.</p><Link className="read" href="/">Back to the journal ↗</Link></main>
}
