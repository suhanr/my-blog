'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Alignment, AutoImage, AutoLink, AutoMediaEmbed, BlockQuote, Bold, ClassicEditor, Code, CodeBlock, Essentials, FindAndReplace, Font, GeneralHtmlSupport, Heading, Highlight, HorizontalLine, Image, ImageCaption, ImageInsert, ImageResize, ImageStyle, ImageToolbar, ImageUpload, Indent, Italic, Link, List, ListProperties, MediaEmbed, PageBreak, Paragraph, PasteFromOffice, RemoveFormat, SelectAll, SimpleUploadAdapter, SourceEditing, SpecialCharacters, SpecialCharactersEssentials, Strikethrough, Subscript, Superscript, Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar, TextTransformation, TodoList, Underline, WordCount,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import { ImagePlus } from 'lucide-react'
import MediaLibrary, { type MediaItem } from '@/app/admin/components/MediaLibrary'

type Category = { id: string; name: string }
type Tag = { id: string; name: string }
type Initial = {
  id?: string; title?: string; slug?: string; excerpt?: string | null; content?: string; contentFormat?: 'HTML' | 'MARKDOWN'; coverImage?: string | null; categoryIds?: string[]; tags?: string[]; seoTitle?: string | null; seoDescription?: string | null; seoKeywords?: string | null; ogImage?: string | null; canonicalUrl?: string | null; noindex?: number
}

const getDraftKey = (id?: string) => `blog-ckeditor-draft:${id || 'new'}`

export default function ProPostEditor({ categories, tags, initial = {} }: { categories: Category[]; tags: Tag[]; initial?: Initial }) {
  const [postId, setPostId] = useState(initial.id)
  const [data, setData] = useState(initial.content || '<p></p>')
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [cover, setCover] = useState(initial.coverImage || '')
  const [fullscreen, setFullscreen] = useState(false)
  const [pickerFor, setPickerFor] = useState<null | 'cover' | 'content'>(null)
  const [submitting, setSubmitting] = useState(false)

  function handlePick(item: MediaItem) {
    if (pickerFor === 'cover') {
      setCover(item.url)
    } else if (pickerFor === 'content') {
      const editor = editorRef.current
      if (editor) {
        try {
          editor.execute('insertImage', { source: { src: item.url, alt: item.alt || '' } })
        } catch {
          editor.execute('insertImage', { source: item.url })
        }
        editor.editing.view.focus()
        setDirty(true)
      }
    }
    setPickerFor(null)
  }
  const wordCountRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<ClassicEditor | null>(null)
  const draftKey = useMemo(() => getDraftKey(postId), [postId])

  useEffect(() => { const saved = localStorage.getItem(draftKey); if (saved) setData(saved) }, [draftKey])
  useEffect(() => { if (!dirty) return; const timer = window.setTimeout(() => { localStorage.setItem(draftKey, data); setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) }, 900); return () => window.clearTimeout(timer) }, [data, dirty, draftKey])

  const plugins = [Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Code, CodeBlock, Subscript, Superscript, RemoveFormat, Font, Highlight, Alignment, BlockQuote, HorizontalLine, List, ListProperties, TodoList, Indent, Link, AutoLink, Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, ImageInsert, AutoImage, SimpleUploadAdapter, MediaEmbed, AutoMediaEmbed, Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption, PasteFromOffice, FindAndReplace, WordCount, SpecialCharacters, SpecialCharactersEssentials, PageBreak, SourceEditing, SelectAll, TextTransformation, GeneralHtmlSupport]

  const toolbar = ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'alignment', '|', 'link', 'blockQuote', 'code', 'codeBlock', '|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent', '|', 'insertImage', 'mediaEmbed', 'insertTable', 'horizontalLine', 'pageBreak', '|', 'highlight', 'specialCharacters', 'removeFormat', '|', 'findAndReplace', 'sourceEditing']

  const config = {
    licenseKey: 'GPL',
    plugins,
    toolbar: { items: toolbar, shouldNotGroupWhenFull: true },
    placeholder: 'Write your story here…',
    image: { toolbar: ['imageTextAlternative', 'toggleImageCaption', '|', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'resizeImage'], upload: { types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'] } },
    table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'] },
    fontFamily: { options: ['default', 'Noto Serif Bengali', 'Georgia', 'Arial', 'Verdana', 'Courier New'] },
    fontSize: { options: [10, 12, 14, 'default', 18, 20, 24, 30, 36] },
    fontColor: { columns: 6, documentColors: 6 },
    fontBackgroundColor: { columns: 6, documentColors: 6 },
    simpleUpload: { uploadUrl: '/api/admin/media' },
    htmlSupport: { allow: [{ name: /.*/, attributes: true, classes: true, styles: true }] },
  }

  const saveIntent = postId ? 'update' : 'create'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = event.currentTarget
    const formData = new FormData(form)
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    if (submitter?.name) formData.set(submitter.name, submitter.value)

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
      const result = await response.json().catch(() => null) as { ok?: boolean; error?: string; id?: string; redirectTo?: string }
      if (!response.ok || !result?.ok) throw new Error(result?.error || 'Could not save the post.')

      localStorage.removeItem(draftKey)
      setDirty(false)
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

      if (result.redirectTo && !postId && result.id) {
        setPostId(result.id)
        window.history.replaceState(window.history.state, '', result.redirectTo)
      }
    } catch (error) {
      console.error('post save failed', error)
      setSavedAt(null)
      window.alert(error instanceof Error ? error.message : 'Could not save the post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={`ck-editor-post-form${fullscreen ? ' ck-editor-post-form--fullscreen' : ''}`} action="/api/admin/posts" method="post" onSubmit={handleSubmit}>
      <input type="hidden" name="intent" value={saveIntent} />
      {postId && <input type="hidden" name="id" value={postId} />}
      <input type="hidden" name="content" value={data} />
      <input type="hidden" name="contentFormat" value="HTML" />
      <input type="hidden" name="coverImage" value={cover} />
      <div className="ck-editor-post-topbar"><div><div className="ck-editor-post-kicker">Publishing</div><div className="ck-editor-post-status">{submitting ? 'Saving changes…' : dirty ? 'Unsaved changes' : 'All changes saved'}{savedAt ? ` · saved ${savedAt}` : ''}</div></div><div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => setPickerFor('content')} disabled={submitting}><ImagePlus size={15} strokeWidth={1.75} style={{ verticalAlign: '-3px', marginRight: 6 }} />Insert image</button><button type="button" onClick={() => setFullscreen(v => !v)} disabled={submitting}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div></div>
      <div className="ck-editor-post-grid">
        <main className="ck-editor-post-main"><div className="ck-editor-post-editor-shell"><CKEditor editor={ClassicEditor} data={data} config={config} onReady={(editor) => { editorRef.current = editor; const wordCount = editor.plugins.get('WordCount'); if (wordCountRef.current && !wordCountRef.current.firstChild) wordCountRef.current.appendChild(wordCount.wordCountContainer) }} onChange={(_, editor) => { setData(editor.getData()); setDirty(true) }} onAfterDestroy={() => { editorRef.current = null; if (wordCountRef.current) wordCountRef.current.innerHTML = '' }} /></div><div className="ck-editor-post-statusbar"><div ref={wordCountRef} /><span>{dirty ? 'Autosave enabled' : 'All changes saved'}</span></div></main>
        <aside className="ck-editor-post-sidebar">
          <section className="ck-editor-post-card"><div className="ck-editor-post-card-title">Document</div><label>Title<input name="title" defaultValue={initial.title} required disabled={submitting} /></label><label>Slug<input name="slug" defaultValue={initial.slug} disabled={submitting} /></label><label>Excerpt<textarea name="excerpt" defaultValue={initial.excerpt || ''} maxLength={500} disabled={submitting} /></label><label>Categories<select name="categoryIds" multiple defaultValue={initial.categoryIds || []} disabled={submitting}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Tags<input name="tags" defaultValue={(initial.tags || []).join(', ')} placeholder="tag, another-tag" disabled={submitting} /></label></section>
          <section className="ck-editor-post-card"><div className="ck-editor-post-card-title">Featured image</div>{cover && <img className="ck-editor-cover" src={cover} alt="" />}<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 10px' }}><button type="button" onClick={() => setPickerFor('cover')} disabled={submitting}><ImagePlus size={15} strokeWidth={1.75} style={{ verticalAlign: '-3px', marginRight: 6 }} />{cover ? 'Change image' : 'Choose from library'}</button>{cover && <button type="button" onClick={() => setCover('')} disabled={submitting}>Remove</button>}</div><label>Image URL<input value={cover} onChange={e => setCover(e.target.value)} placeholder="https://..." disabled={submitting} /></label></section>
          <section className="ck-editor-post-card"><div className="ck-editor-post-card-title">SEO</div><label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle || ''} maxLength={60} disabled={submitting} /></label><label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription || ''} maxLength={160} disabled={submitting} /></label><label>Keywords<input name="seoKeywords" defaultValue={initial.seoKeywords || ''} disabled={submitting} /></label><label>Canonical URL<input name="canonicalUrl" defaultValue={initial.canonicalUrl || ''} disabled={submitting} /></label><label>Open Graph image<input name="ogImage" defaultValue={initial.ogImage || ''} disabled={submitting} /></label><label className="ck-editor-check"><input type="checkbox" name="noindex" value="1" defaultChecked={initial.noindex === 1} disabled={submitting} /> Prevent indexing</label></section>
        </aside>
      </div>
      <div className="ck-editor-post-actions"><div><button className="primary-action" name="status" value="DRAFT" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save draft'}</button><button className="publish-action" name="status" value="PUBLISHED" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Publish'}</button>{postId && <button className="danger-action" name="action" value="trash" type="submit" formNoValidate disabled={submitting}>{submitting ? 'Saving…' : 'Move to Trash'}</button>}</div></div>
      {pickerFor && <MediaLibrary mode="picker" onPick={handlePick} onClose={() => setPickerFor(null)} />}
    </form>
  )
}