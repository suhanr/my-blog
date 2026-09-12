'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'

type Category = { id: string; name: string }
type Tag = { id: string; name: string }
type Media = { id: string; url: string; filename: string | null; mimeType?: string; size?: number }
type Initial = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string | null
  content?: string
  contentFormat?: 'HTML' | 'MARKDOWN'
  coverImage?: string | null
  categoryIds?: string[]
  tags?: string[]
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  ogImage?: string | null
  canonicalUrl?: string | null
  noindex?: number
}
type PickerMode = 'insert' | 'cover'

function formatBytes(value?: number) { if (!value) return ''; const units = ['B','KB','MB']; let size = value; let unit = 0; while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1 } return `${size.toFixed(unit ? 1 : 0)} ${units[unit]}` }
function linkPrompt() { return window.prompt('Enter URL') || '' }

export default function PostEditor({ categories, tags, initial = {} }: { categories: Category[]; tags: Tag[]; initial?: Initial }) {
  const initialHtml = useMemo(() => { const raw = initial.content || ''; if (!raw) return ''; return initial.contentFormat === 'HTML' ? raw : (marked.parse(raw, { async: false }) as string) }, [initial.content, initial.contentFormat])
  const [html, setHtml] = useState(initialHtml)
  const [preview, setPreview] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [cover, setCover] = useState(initial.coverImage || '')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [pickerMode, setPickerMode] = useState<PickerMode>('insert')
  const [media, setMedia] = useState<Media[]>([])
  const [mediaQuery, setMediaQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const key = useMemo(() => `blog-rich-draft:${initial.id || 'new'}`, [initial.id])

  useEffect(() => { const saved = window.localStorage.getItem(key); if (saved) setHtml(saved) }, [key])
  useEffect(() => { const timer = window.setTimeout(() => { if (!html) return; window.localStorage.setItem(key, html); setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) }, 900); return () => window.clearTimeout(timer) }, [key, html])
  useEffect(() => { if (!editorRef.current || preview) return; if (editorRef.current.innerHTML !== html) editorRef.current.innerHTML = html }, [html, preview])

  function syncEditor() { const value = editorRef.current?.innerHTML || ''; setHtml(value); setDirty(true) }
  function exec(command: string, value?: string) { editorRef.current?.focus(); document.execCommand(command, false, value); syncEditor() }
  function formatBlock(value: string) { exec('formatBlock', value) }
  function createLink() { const url = linkPrompt(); if (url) exec('createLink', url) }
  function insertImage(url: string, alt = 'Image') { editorRef.current?.focus(); document.execCommand('insertHTML', false, `<img src="${url.replaceAll('"','&quot;')}" alt="${alt.replaceAll('"','&quot;')}" />`); syncEditor() }

  async function loadMedia(open = true) { if (open) setMediaOpen(true); const response = await fetch('/api/admin/media'); if (response.ok) setMedia((await response.json()).media || []) }
  async function chooseMedia(item: Media) { if (pickerMode === 'cover') setCover(item.url); else insertImage(item.url, item.filename || 'Image'); setMediaOpen(false) }
  async function upload(file: File, mode: PickerMode = 'insert') { setUploading(true); try { const form = new FormData(); form.append('file', file); const response = await fetch('/api/admin/media', { method: 'POST', body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Upload failed'); if (mode === 'cover') setCover(data.url); else insertImage(data.url, file.name); await loadMedia(false) } finally { setUploading(false) } }
  function openMedia(mode: PickerMode) { setPickerMode(mode); setMediaQuery(''); void loadMedia(true) }
  function insertTable() { exec('insertHTML', '<table><tbody><tr><th>Heading</th><th>Heading</th></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p></p>') }
  function clearFormatting() { exec('removeFormat'); exec('unlink') }
  function handleShortcut(event: React.KeyboardEvent<HTMLDivElement>) { if (!(event.ctrlKey || event.metaKey)) return; const keyName = event.key.toLowerCase(); if (keyName === 'b') { event.preventDefault(); exec('bold') } if (keyName === 'i') { event.preventDefault(); exec('italic') } if (keyName === 'k') { event.preventDefault(); createLink() } if (keyName === 's') { event.preventDefault(); (event.currentTarget.closest('form') as HTMLFormElement | null)?.requestSubmit() } }
  const visibleMedia = media.filter(item => (item.filename || '').toLowerCase().includes(mediaQuery.toLowerCase()))

  return <form className={`admin-form post-editor${fullscreen ? ' editor-fullscreen' : ''}`} action="/api/admin/posts" method="post" onSubmit={() => window.localStorage.removeItem(key)}>
    <input type="hidden" name="intent" value={initial.id ? 'update' : 'create'} />{initial.id && <input type="hidden" name="id" value={initial.id} />}<input type="hidden" name="content" value={html} /><input type="hidden" name="contentFormat" value="HTML" /><input type="hidden" name="coverImage" value={cover} />
    <div className="editor-topbar"><div><span className="meta">Classic editor</span><span className="autosave">{dirty ? 'Unsaved changes' : 'Ready'}{savedAt ? ` · saved ${savedAt}` : ''}</span></div><div className="editor-view-toggle"><button type="button" className={!preview ? 'button' : 'meta'} onClick={() => setPreview(false)}>Write</button><button type="button" className={preview ? 'button' : 'meta'} onClick={() => setPreview(true)}>Preview</button><button type="button" className="meta" onClick={() => setFullscreen(v => !v)}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div></div>
    <div className="form-row"><label>Title<input name="title" defaultValue={initial.title} required autoFocus /></label><label>Slug<input name="slug" defaultValue={initial.slug} /></label></div>
    <div className="form-row"><label>Categories<select name="categoryIds" multiple size={Math.min(Math.max(categories.length, 4), 8)} defaultValue={initial.categoryIds || []}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Tags<input name="tags" defaultValue={(initial.tags || []).join(', ')} list="tag-suggestions" /><datalist id="tag-suggestions">{tags.map(t => <option key={t.id} value={t.name} />)}</datalist></label></div>
    <label>Excerpt<textarea name="excerpt" defaultValue={initial.excerpt || ''} maxLength={500} /></label>
    <div className="editor-layout"><section className="editor-main">{!preview ? <><div className="classic-toolbar" aria-label="Classic editor toolbar"><select aria-label="Format" defaultValue="p" onChange={e => formatBlock(e.target.value)}><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option><option value="pre">Preformatted</option></select><span className="toolbar-divider" /><button type="button" title="Undo" onClick={() => exec('undo')}>↶</button><button type="button" title="Redo" onClick={() => exec('redo')}>↷</button><span className="toolbar-divider" /><button type="button" title="Bold" onClick={() => exec('bold')}><b>B</b></button><button type="button" title="Italic" onClick={() => exec('italic')}><i>I</i></button><button type="button" title="Underline" onClick={() => exec('underline')}><u>U</u></button><button type="button" title="Strikethrough" onClick={() => exec('strikeThrough')}><s>S</s></button><button type="button" title="Remove formatting" onClick={clearFormatting}>Tx</button><span className="toolbar-divider" /><button type="button" title="Align left" onClick={() => exec('justifyLeft')}>≡</button><button type="button" title="Align center" onClick={() => exec('justifyCenter')}>≡</button><button type="button" title="Align right" onClick={() => exec('justifyRight')}>≡</button><span className="toolbar-divider" /><button type="button" title="Bulleted list" onClick={() => exec('insertUnorderedList')}>• List</button><button type="button" title="Numbered list" onClick={() => exec('insertOrderedList')}>1. List</button><button type="button" title="Quote" onClick={() => formatBlock('blockquote')}>Quote</button><span className="toolbar-divider" /><button type="button" title="Link" onClick={createLink}>Link</button><button type="button" title="Unlink" onClick={() => exec('unlink')}>Unlink</button><button type="button" title="Insert image" onClick={() => openMedia('insert')}>Image</button><button type="button" title="Insert table" onClick={insertTable}>Table</button><label className="toolbar-upload">Upload<input type="file" hidden accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f, 'insert'); e.currentTarget.value = '' }} /></label></div><div ref={editorRef} className="classic-editor-surface" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" onInput={syncEditor} onKeyDown={handleShortcut} spellCheck /><div className="editor-statusbar"><span>{html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length} words</span><span>{html.length.toLocaleString()} characters</span><span>Ctrl/Cmd+S save · Ctrl/Cmd+K link</span></div></> : <div className="editor-preview prose" dangerouslySetInnerHTML={{ __html: html || '<p>Nothing to preview.</p>' }} />}</section>
      <aside className="editor-sidebar"><div className="panel"><div className="panel-heading"><h3>Featured image</h3><button type="button" className="meta" onClick={() => openMedia('cover')}>Choose</button></div><CoverInput value={cover} onChange={setCover} onUpload={f => void upload(f, 'cover')} uploading={uploading} /></div><div className="panel"><h3>SEO</h3><label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle || ''} maxLength={60} /></label><label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription || ''} maxLength={160} /></label><label>Keywords<input name="seoKeywords" defaultValue={initial.seoKeywords || ''} /></label><label>Canonical URL<input name="canonicalUrl" defaultValue={initial.canonicalUrl || ''} /></label><label>OG image<input name="ogImage" defaultValue={initial.ogImage || ''} /></label><label className="check"><input type="checkbox" name="noindex" value="1" defaultChecked={initial.noindex === 1} /> Prevent indexing</label></div></aside></div>
    <div className="editor-actions"><div><button className="button" name="status" value="DRAFT">Save draft</button><button className="button" name="status" value="PUBLISHED">Publish</button>{initial.id && <button className="danger-button" name="intent" value="trash" formNoValidate>Move to Trash</button>}</div><span className="muted">Classic WordPress-style editor · rich text · media library · preview · autosave</span></div>
    {mediaOpen && <div className="media-modal" onMouseDown={e => { if (e.target === e.currentTarget) setMediaOpen(false) }}><div className="media-dialog"><div className="editor-topbar"><div><span className="meta">Media library</span><h3 style={{ margin: '4px 0 0' }}>Select media</h3></div><div className="editor-view-toggle"><label className="button small">Upload<input type="file" hidden accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f, pickerMode); e.currentTarget.value = '' }} /></label><button type="button" className="meta" onClick={() => setMediaOpen(false)}>Close</button></div></div><input className="media-search" value={mediaQuery} onChange={e => setMediaQuery(e.target.value)} placeholder="Search media…" /><div className="media-grid">{visibleMedia.length ? visibleMedia.map(item => <button className="media-card" type="button" key={item.id} onClick={() => void chooseMedia(item)}><img src={item.url} alt=""/><span>{item.filename || 'Image'}</span><small>{formatBytes(item.size)}</small></button>) : <p className="muted">No media found. Upload an image to get started.</p>}</div></div></div>}
  </form>
}

function CoverInput({ value, onChange, onUpload, uploading }: { value: string; onChange: (v: string) => void; onUpload: (f: File) => void; uploading: boolean }) { return <div className="cover-picker"><div className="cover-preview">{value ? <img src={value} alt="" /> : <span>No featured image</span>}</div><input value={value} onChange={e => onChange(e.target.value)} placeholder="Paste image URL" /><label className="button small">{uploading ? 'Uploading…' : 'Upload image'}<input type="file" hidden accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.currentTarget.value = '' }} /></label></div> }
