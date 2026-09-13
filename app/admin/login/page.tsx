import Link from 'next/link'

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <main className="login">
      <form className="login-card" action="/api/admin/login" method="post">
        <p className="kicker">Suhanur Rahman / CMS</p>
        <h1>Admin login</h1>
        <p className="muted">Use the private admin password configured in Cloudflare.</p>
        {params.error ? <p className="login-error">Invalid password. Please try again.</p> : null}
        <input type="password" name="password" placeholder="Admin password" required autoFocus />
        <button className="button" type="submit">Sign in</button>
        <Link className="meta" href="/">← Back to journal</Link>
      </form>
    </main>
  )
}
