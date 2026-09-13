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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) setData(saved)
    } catch {}
  }, [draftKey])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, data)
        setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      } catch {}
    }, 900)
    return () => window.clearTimeout(timer)
  }, [data, dirty, draftKey])

  const plugins = [Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Code, CodeBlock, Subscript, Superscript, RemoveFormat, Font, Highlight, Alignment, BlockQuote, HorizontalLine, List, ListProperties, TodoList, Indent, Link, AutoLink, Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, ImageInsert, AutoImage, SimpleUploadAdapter, MediaEmbed, AutoMediaEmbed, Table, TableToolbar, TableProperties, TableCellProperties, TableColumnResize, TableCaption, PasteFromOffice, FindAndReplace, WordCount, SpecialCharacters, SpecialCharactersEssentials, PageBreak, SourceEditing, SelectAll, TextTransformation, GeneralHtmlSupport]
  const toolbar = ['undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'underline', 'strikethrough', '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'alignment', '|', 'link', 'blockQuote', 'code', 'codeBlock', '|', 'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent', '|', 'insertImage', 'mediaEmbed', 'insertTable', 'horizontalLine', 'pageBreak', '|', 'highlight', 'specialCharacters', 'removeFormat', '|', 'findAndReplace', 'sourceEditing']
  const config = {
    licenseKey: 'GPL', plugins,
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
      const response = await fetch('/api/admin/posts', { method: 'POST', body: formData, headers: { Accept: 'application/json' } })
      const result = await response.json().catch(() => null) as { ok?: boolean; error?: string; id?: string; redirectTo?: string }
      if (!response.ok || !result?.ok) throw new Error(result?.error || 'Could not save the post.')
      try { localStorage.removeItem(draftKey) } catch {}
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
      <style>{`
        .ck-editor-post-form { display:flex; flex-direction:column; min-height:calc(100vh - 130px); max-height:calc(100vh - 130px); }
        .ck-editor-post-form:not(.ck-editor-post-form--fullscreen) { overflow:hidden; }
        .ck-editor-post-form--fullscreen { max-height:none; }
        .ck-editor-post-heading { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(250px,.8fr); gap:18px; padding:18px 26px 14px; border-bottom:1px solid var(--e-border); background:var(--e-card); flex:0 0 auto; }
        .ck-editor-post-heading label { display:grid; gap:7px; color:var(--e-text); font-size:14px; font-weight:700; }
        .ck-editor-post-heading label::first-line { color:var(--e-text); }
        .ck-editor-post-heading input { width:100%; min-width:0; height:54px; border:1px solid #cbd5e1; border-radius:10px; padding:0 15px; background:#fff; color:var(--e-text); font-family:inherit; font-size:18px; font-weight:600; outline:none; box-shadow:0 0 0 1px rgba(13,148,136,.05); transition:border-color .15s ease, box-shadow .15s ease; }
        .ck-editor-post-heading label:first-child input { font-size:20px; }
        .ck-editor-post-heading input::placeholder { color:#94a3b8; font-weight:500; }
        .ck-editor-post-heading input:focus { border-color:var(--e-primary); box-shadow:0 0 0 3px var(--e-ring); }
        .ck-editor-post-heading label:first-child { color:var(--e-primary-hover); }
        .ck-editor-post-heading label:last-child { color:#475569; }
        .ck-editor-post-grid { flex:1 1 auto; min-height:0; overflow:hidden; }
        .ck-editor-post-main { display:flex; flex-direction:column; min-width:0; min-height:0; height:100%; }
        .ck-editor-post-editor-shell { flex:1 1 auto; min-height:0; display:flex; flex-direction:column; }
        .ck-editor-post-editor-shell .ck-editor { display:flex; flex-direction:column; min-height:0; height:100%; }
        .ck-editor-post-editor-shell .ck-editor__main { min-height:0; flex:1 1 auto; }
        .ck-editor-post-editor-shell .ck-editor__main > .ck-editor__editable { height:100%; min-height:0; max-height:none; overflow-y:auto; }
        .ck-editor-post-statusbar { flex:0 0 auto; }
        .ck-editor-post-sidebar { max-height:none; height:100%; overflow-y:auto; overscroll-behavior:contain; }
        .ck-editor-post-card-title { font-size:16px; }
        .ck-editor-post-card label { font-size:14px; gap:7px; }
        .ck-editor-post-card input, .ck-editor-post-card textarea, .ck-editor-post-card select { font-size:15.5px; }
        .ck-editor-post-card textarea { line-height:1.55; }
        .ck-editor-post-card select[multiple] { font-size:15px; }
        .ck-editor-help { margin-top:-3px; color:var(--e-muted-foreground); font-size:12px; line-height:1.45; }
        .ck-editor-seo-hint { margin:-2px 0 11px; padding:8px 10px; border-left:3px solid var(--e-primary); border-radius:0 7px 7px 0; background:#f0fdfa; color:#475569; font-size:12px; line-height:1.5; }
        .ck-editor-post-actions { flex:0 0 auto; }
        @media (max-width:900px) {
          .ck-editor-post-form { min-height:auto; max-height:none; overflow:visible; }
          .ck-editor-post-heading { grid-template-columns:1fr; padding:16px; }
          .ck-editor-post-grid { overflow:visible; }
          .ck-editor-post-main { height:auto; min-height:0; }
          .ck-editor-post-editor-shell { min-height:560px; }
          .ck-editor-post-editor-shell .ck-editor__main > .ck-editor__editable { height:560px; }
          .ck-editor-post-sidebar { height:auto; max-height:none; overflow:visible; }
        }
        @media (max-width:640px) {
          .ck-editor-post-heading input, .ck-editor-post-heading label:first-child input { font-size:16px; height:50px; }
        }
      `}</style>

      <input type="hidden" name="intent" value={saveIntent} />
      {postId && <input type="hidden" name="id" value={postId} />}
      <input type="hidden" name="content" value={data} />
      <input type="hidden" name="contentFormat" value="HTML" />
      <input type="hidden" name="coverImage" value={cover} />

      <div className="ck-editor-post-topbar">
        <div><div className="ck-editor-post-kicker">Publishing</div><div className="ck-editor-post-status">{submitting ? 'Saving changes…' : dirty ? 'Unsaved changes' : 'All changes saved'}{savedAt ? ` · saved ${savedAt}` : ''}</div></div>
        <div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => setPickerFor('content')} disabled={submitting}><ImagePlus size={15} strokeWidth={1.75} style={{ verticalAlign: '-3px', marginRight: 6 }} />Insert image</button><button type="button" onClick={() => setFullscreen(v => !v)} disabled={submitting}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
      </div>

      <div className="ck-editor-post-heading">
        <label>Title<input name="title" defaultValue={initial.title} placeholder="লেখার শিরোনাম লিখুন…" required disabled={submitting} aria-label="Post title" /></label>
        <label>Slug<input name="slug" defaultValue={initial.slug} placeholder="post-url-slug" disabled={submitting} aria-label="Post slug" /><span className="ck-editor-help">URL-এর জন্য সংক্ষিপ্ত ইংরেজি slug ব্যবহার করুন।</span></label>
      </div>

      <div className="ck-editor-post-grid">
        <main className="ck-editor-post-main">
          <div className="ck-editor-post-editor-shell">
            <CKEditor editor={ClassicEditor} data={data} config={config}
              onReady={(editor) => { editorRef.current = editor; const wordCount = editor.plugins.get('WordCount'); if (wordCountRef.current && !wordCountRef.current.firstChild) wordCountRef.current.appendChild(wordCount.wordCountContainer) }}
              onChange={(_, editor) => { setData(editor.getData()); setDirty(true) }}
              onAfterDestroy={() => { editorRef.current = null; if (wordCountRef.current) wordCountRef.current.innerHTML = '' }}
            />
          </div>
          <div className="ck-editor-post-statusbar"><div ref={wordCountRef} /><span>{dirty ? 'Autosave enabled' : 'All changes saved'}</span></div>
        </main>

        <aside className="ck-editor-post-sidebar">
          <section className="ck-editor-post-card">
            <div className="ck-editor-post-card-title">Document</div>
            <label>Excerpt<textarea name="excerpt" defaultValue={initial.excerpt || ''} maxLength={500} placeholder="লেখাটির ১–২ বাক্যের সংক্ষিপ্ত সারাংশ…" disabled={submitting} /></label>
            <label>Categories<select name="categoryIds" multiple defaultValue={initial.categoryIds || []} disabled={submitting}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><span className="ck-editor-help">এক বা একাধিক প্রাসঙ্গিক বিভাগ নির্বাচন করুন।</span></label>
            <label>Tags<input name="tags" defaultValue={(initial.tags || []).join(', ')} placeholder="ai, technology, research" disabled={submitting} /><span className="ck-editor-help">কমা দিয়ে একাধিক tag আলাদা করুন।</span></label>
          </section>

          <section className="ck-editor-post-card">
            <div className="ck-editor-post-card-title">Featured image</div>
            {cover && <img className="ck-editor-cover" src={cover} alt="" />}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 10px' }}><button type="button" onClick={() => setPickerFor('cover')} disabled={submitting}><ImagePlus size={15} strokeWidth={1.75} style={{ verticalAlign: '-3px', marginRight: 6 }} />{cover ? 'Change image' : 'Choose from library'}</button>{cover && <button type="button" onClick={() => setCover('')} disabled={submitting}>Remove</button>}</div>
            <label>Image URL<input value={cover} onChange={e => setCover(e.target.value)} placeholder="https://..." disabled={submitting} /></label>
            <p className="ck-editor-help">সাইটের cover image হিসেবে ব্যবহৃত হবে।</p>
          </section>

          <section className="ck-editor-post-card">
            <div className="ck-editor-post-card-title">SEO</div>
            <div className="ck-editor-seo-hint">SEO title ও meta description Google ও সামাজিক শেয়ার preview-তে গুরুত্বপূর্ণ। সাধারণত title ছোট ও স্পষ্ট এবং description প্রায় ১২০–১৬০ অক্ষরের মধ্যে রাখা ভালো।</div>
            <label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle || ''} maxLength={60} placeholder="Search-এ দেখানোর শিরোনাম" disabled={submitting} /></label>
            <label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription || ''} maxLength={160} placeholder="১২০–১৬০ অক্ষরের সংক্ষিপ্ত বর্ণনা" disabled={submitting} /></label>
            <label>Keywords<input name="seoKeywords" defaultValue={initial.seoKeywords || ''} placeholder="ai, technology, research" disabled={submitting} /></label>
            <label>Canonical URL<input name="canonicalUrl" defaultValue={initial.canonicalUrl || ''} placeholder="https://blog.suhanurrahman.com/post-slug/" disabled={submitting} /></label>
            <label>Open Graph image<input name="ogImage" defaultValue={initial.ogImage || ''} placeholder="Social share image URL" disabled={submitting} /></label>
            <label className="ck-editor-check"><input type="checkbox" name="noindex" value="1" defaultChecked={initial.noindex === 1} disabled={submitting} /> Prevent indexing</label>
            <span className="ck-editor-help">প্রয়োজন না হলে এটি চালু করবেন না। চালু করলে search engine-কে এই পোস্ট index না করতে বলা হবে।</span>
          </section>
        </aside>
      </div>

      <div className="ck-editor-post-actions"><div><button className="primary-action" name="status" value="DRAFT" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save draft'}</button><button className="publish-action" name="status" value="PUBLISHED" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Publish'}</button>{postId && <button className="danger-action" name="action" value="trash" type="submit" formNoValidate disabled={submitting}>{submitting ? 'Saving…' : 'Move to Trash'}</button>}</div></div>
      {pickerFor && <MediaLibrary mode="picker" onPick={handlePick} onClose={() => setPickerFor(null)} />}
    </form>
  )
}
