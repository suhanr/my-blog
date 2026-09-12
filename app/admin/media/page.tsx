'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MediaPage() {
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/admin/media', { method: 'POST', body: form })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      setUrl(data.url || ''); setMessage('Uploaded successfully. Copy the URL into a post.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally { setBusy(false) }
  }
  return <div className="admin-wrap"><div className="admin-shell"><aside className="admin-side"><Link className="brand" href="/admin/">SUHANUR RAHMAN / CMS</Link><nav className="admin-nav"><Link href="/admin/">Dashboard</Link><Link href="/admin/posts/new/">New post</Link><Link href="/admin/media/">Media</Link><Link href="/admin/comments/">Comments</Link></nav></aside><main className="admin-main"><p className="kicker">Media library</p><h1 className="serif">Upload image</h1><form className="admin-form" onSubmit={upload}><input name="file" type="file" accept="image/*" required/><button className="button" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload to R2'}</button>{message ? <p className="success">{message}</p> : null}{url ? <label>Image URL<input readOnly value={url} onFocus={(e)=>e.currentTarget.select()} /></label> : null}</form></main></div></div>
}
