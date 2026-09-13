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
  return (
    <>
      <div className="admin-page-head">
        <div>
          <p className="kicker">Media library</p>
          <h1>Upload image</h1>
          <p>Send an image to R2, then copy its URL into a post.</p>
        </div>
      </div>
      <form className="admin-form" style={{ maxWidth: 620 }} onSubmit={upload}>
        <label>Image file<input name="file" type="file" accept="image/*" required /></label>
        <div><button className="button" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Upload to R2'}</button></div>
        {message ? <p className="success">{message}</p> : null}
        {url ? <label>Image URL<input readOnly value={url} onFocus={(e) => e.currentTarget.select()} /></label> : null}
      </form>
    </>
  )
}
