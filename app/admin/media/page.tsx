'use client'

import { useState } from 'react'
import { Copy, UploadCloud } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from '@/app/admin/components/ui'

export default function MediaPage() {
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/media', { method: 'POST', body: form })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      setUrl(data.url || '')
      setMessage('Uploaded successfully. Copy the URL into a post.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Media library</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">Upload image</h1>
        <p className="mt-1 text-sm text-muted-foreground">Send an image to R2, then copy its URL into a post.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New upload</CardTitle>
          <CardDescription>JPG, PNG, GIF or WebP. Stored in your R2 bucket.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={upload} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Image file</Label>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/*"
                required
                className="block w-full cursor-pointer rounded-lg border border-dashed border-input bg-muted/40 p-3 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
              />
            </div>
            <div>
              <Button type="submit" disabled={busy}>
                <UploadCloud className="size-4" strokeWidth={1.75} />
                {busy ? 'Uploading…' : 'Upload to R2'}
              </Button>
            </div>
            {message && (
              <p className={url ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700' : 'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700'}>
                {message}
              </p>
            )}
            {url && (
              <div className="grid gap-2">
                <Label>Image URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard?.writeText(url)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                  >
                    <Copy className="size-4" strokeWidth={1.75} /> {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  )
}
