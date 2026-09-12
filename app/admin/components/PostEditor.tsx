'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'

type Category = { id: string; name: string }
type Tag = { id: string; name: string }
type InitialPost = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string
  coverImage?: string | null
  categoryIds?: string[]
  tags?: string[]
  status?: string
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  ogImage?: string | null
  canonicalUrl?: string | null
  noindex?: number
}

function wrapSelection(value: string, start: number, end: number, before: string, after = before) {
  return value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end)
}

export default function PostEditor({ categories, tags, initial = {} }: { categories: Category[]; tags: Tag[]; initial?: InitialPost }) {
  const [content, setContent] = useState(initial.content || '')
  const [preview, setPreview] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [media, setMedia] = useState<{ id: string; url: string; filename: string | null }[]>([])
  const [uploading, setUploading] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const autosaveKey = useMemo(() => `blog-draft:${initial.id || 'new'}`, [initial.id])

  useEffect(() => {
    const stored = window.localStorage.getItem(autosaveKey)
    if (stored) setContent(stored)
  }, [autosaveKey])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!content) return
      window.localStorage.setItem(autosaveKey, content)
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [autosaveKey, content])

  function edit(action: (value: string, start: number, end: number) => string) {
    const el = editorRef.current
    if (!el) return
    const next = action(content, el.selectionStart, el.selectionEnd)
    setContent(next)
    setDirty(true)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(Math.min(el.selectionStart, next.length), Math.min(el.selectionEnd, next.length))
    })
  }

  function toolbar(type: string) {
    edit((value, start, end) => {
      const selected = value.slice(start, end) || 'text'
      switch (type) {
        case 'h2': return value.slice(0, start) + `## ${selected}` + value.slice(end)
        case 'h3': return value.slice(0, start) + `### ${selected}` + value.slice(end)
        case 'bold': return wrapSelection(value, start, end, '**')
        case 'italic': return wrapSelection(value, start, end, '_')
        case 'quote': return value.slice(0, start) + `> ${selected}` + value.slice(end)
        case 'code': return wrapSelection(value, start, end, '`')
        case 'link': return value.slice(0, start) + `[${selected}](https://)` + value.slice(end)
        case 'ul': return value.slice(0, start) + selected.split('\n').map((line) => `- ${line}`).join('\n') + value.slice(end)
        case 'ol': return value.slice(0, start) + selected.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') + value.slice(end)
        default: return value
      }
    })
  }

  async function loadMedia() {
    setMediaOpen(true)
    const response = await fetch('/api/admin/media')
    if (response.ok) {
      const data = await response.json()
      setMedia(data.media || [])
    }
  }

  async function uploadImage(file: File, insert = false) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/admin/media', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      if (insert) {
        edit((value, start, end) => value.slice(0, start) + `![${file.name}](${data.url})` + value.slice(end))
      }
      await loadMedia()
    } finally {
      setUploading(false)
    }
  }

  function insertImage(url: string) {
    edit((value, start, end) => value.slice(0, start) + `![Image](${url})` + value.slice(end))
    setMediaOpen(false)
  }

  return <form className="admin-form post-editor" action="/api/admin/posts" method="post" onSubmit={() => window.localStorage.removeItem(autosaveKey)}>
    <input type="hidden" name="intent" value={initial.id ? 'update' : 'create'} />
    {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

    <div className="editor-topbar"><div><span className="meta">Publishing</span><span className="autosave">{dirty ? 'Unsaved changes' : savedAt ? `Autosaved ${savedAt}` : 'Ready'}</span></div><div className="editor-view-toggle"><button type="button" className={preview ? 'meta' : 'button'} onClick={() => setPreview(false)}>Write</button><button type="button" className={preview ? 'button' : 'meta'} onClick={() => setPreview(true)}>Preview</button></div></div>

    <div className="form-row"><label>Title<input name="title" defaultValue={initial.title} required autoFocus /></label><label>Slug<input name="slug" defaultValue={initial.slug} placeholder="auto-generated-from-title" /></label></div>

    <div className="form-row"><label>Categories<select name="categoryIds" multiple size={Math.min(Math.max(categories.length, 4), 8)} defaultValue={initial.categoryIds || []}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Tags<input name="tags" defaultValue={(initial.tags || []).join(', ')} list="tag-suggestions" placeholder="ai, research, technology" /><datalist id="tag-suggestions">{tags.map((tag) => <option key={tag.id} value={tag.name} />)}</datalist></label></div>

    <label>Excerpt<textarea name="excerpt" defaultValue={initial.excerpt || ''} className="excerpt-field" maxLength={500} /></label>

    <div className="editor-layout">
      <section className="editor-main"><div className="editor-toolbar"><button type="button" onClick={() => toolbar('h2')}>H2</button><button type="button" onClick={() => toolbar('h3')}>H3</button><button type="button" onClick={() => toolbar('bold')}><b>B</b></button><button type="button" onClick={() => toolbar('italic')}><i>I</i></button><button type="button" onClick={() => toolbar('quote')}>Quote</button><button type="button" onClick={() => toolbar('code')}>Code</button><button type="button" onClick={() => toolbar('link')}>Link</button><button type="button" onClick={() => toolbar('ul')}>• List</button><button type="button" onClick={() => toolbar('ol')}>1. List</button><button type="button" onClick={loadMedia}>Media</button><label className="toolbar-upload">Upload image<input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file, true) }} /></label></div>{preview ? <div className="editor-preview prose" dangerouslySetInnerHTML={{ __html: marked.parse(content || '*Nothing to preview*') as string }} /> : <textarea ref={editorRef} className="editor" name="content" value={content} onChange={(e) => { setContent(e.target.value); setDirty(true) }} placeholder="# Your headline\n\nWrite your article here..." required />}</section>

      <aside className="editor-sidebar"><div className="panel"><h3>Featured image</h3><input type="hidden" name="coverImage" value={initial.coverImage || ''} /><CoverImageInput value={initial.coverImage || ''} onChange={(value) => { const input = document.querySelector<HTMLInputElement>('input[name="coverImage"]'); if (input) input.value = value }} onUpload={(file) => uploadImage(file, false)} uploading={uploading} /></div><div className="panel"><h3>SEO</h3><label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle || ''} maxLength={60} placeholder="Leave blank to use post title" /></label><label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription || ''} maxLength={160} /></label><label>Keywords<input name="seoKeywords" defaultValue={initial.seoKeywords || ''} placeholder="ai, technology, research" /></label><label>Canonical URL<input name="canonicalUrl" defaultValue={initial.canonicalUrl || ''} placeholder="https://..." /></label><label>OG image<input name="ogImage" defaultValue={initial.ogImage || ''} /></label><label className="check"><input type="checkbox" name="noindex" value="1" defaultChecked={initial.noindex === 1} /> Prevent indexing</label></div></aside>
    </div>

    <div className="editor-actions"><div><button className="button" name="status" value="DRAFT">Save draft</button> <button className="button" name="status" value="PUBLISHED">Publish</button>{initial.id ? <button className="danger-button" name="intent" value="trash" formNoValidate>Move to Trash</button> : null}</div><span className="muted">{uploading ? 'Uploading image…' : 'Changes are autosaved locally.'}</span></div>

    {mediaOpen ? <div className="media-modal" role="dialog" aria-modal="true"><div className="media-dialog"><div className="editor-topbar"><h3>Media library</h3><button type="button" className="meta" onClick={() => setMediaOpen(false)}>Close</button></div><div className="media-grid">{media.length ? media.map((item) => <button type="button" className="media-card" key={item.id} onClick={() => insertImage(item.url)}><img src={item.url} alt={item.filename || ''}/><span>{item.filename || 'Image'}</span></button>) : <p className="muted">No newly uploaded images yet. Upload one from the editor toolbar.</p>}</div></div></div> : null}
  </form>
}

function CoverImageInput({ value, onChange, onUpload, uploading }: { value: string; onChange: (value: string) => void; onUpload: (file: File) => void; uploading: boolean }) {
  const [url, setUrl] = useState(value)
  return <div className="cover-picker"><div className="cover-preview">{url ? <img src={url} alt="" /> : <span>No featured image</span>}</div><input value={url} onChange={(e) => { setUrl(e.target.value); onChange(e.target.value) }} placeholder="Paste image URL"/><label className="button small">{uploading ? 'Uploading…' : 'Upload image'}<input type="file" hidden accept="image/*" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file) }} /></label></div>
}
