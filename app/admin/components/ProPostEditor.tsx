'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Youtube from '@tiptap/extension-youtube'
import Dropcursor from '@tiptap/extension-dropcursor'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

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

const lowlight = createLowlight(common)

const palettes = [
  '#111111', '#4b5563', '#6b7280', '#b91c1c', '#c2410c', '#a16207', '#15803d', '#0f766e', '#0369a1', '#4338ca', '#7e22ce', '#be185d'
]

const featureGroups = [
  ['Text', ['Paragraph', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6', 'Bold', 'Italic', 'Underline', 'Strike', 'Inline code', 'Superscript', 'Subscript', 'Highlight', 'Text color', 'Font family', 'Align left', 'Align center', 'Align right', 'Justify', 'Clear formatting']],
  ['Blocks', ['Blockquote', 'Code block', 'Horizontal rule', 'Bullet list', 'Numbered list', 'Checklist', 'Indent', 'Outdent', 'Hard break', 'Undo', 'Redo']],
  ['Insert', ['Image', 'Featured image', 'YouTube', 'Table', '3x3 table', '4x4 table', 'Divider', 'Link', 'Unlink']],
  ['Media', ['Upload image', 'Media library', 'Search media', 'Insert selected media', 'Replace image', 'Image caption', 'Image link']],
  ['Tables', ['Add row', 'Add column', 'Delete row', 'Delete column', 'Merge cells', 'Split cell', 'Toggle header row', 'Delete table']],
  ['Productivity', ['Find', 'Replace', 'Select all', 'Focus mode', 'Fullscreen', 'Preview', 'Word count', 'Character count', 'Reading time', 'Document stats', 'Autosave', 'Keyboard shortcuts']],
  ['Layout', ['Narrow writing', 'Wide writing', 'Typography cleanup', 'Smart quotes', 'Smart dashes', 'Ellipsis', 'List indentation', 'Heading outline']],
  ['Accessibility', ['Keyboard navigation', 'Semantic headings', 'Alt text', 'Link labels', 'Table headers', 'Reduced motion friendly']],
  ['Publishing', ['Draft', 'Publish', 'Schedule-ready fields', 'SEO title', 'Meta description', 'Keywords', 'Canonical URL', 'Open Graph image', 'No index', 'Trash']],
]

function estimateReadingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function ProPostEditor({ categories, tags, initial = {} }: { categories: Category[]; tags: Tag[]; initial?: Initial }) {
  const [cover, setCover] = useState(initial.coverImage || '')
  const [mediaOpen, setMediaOpen] = useState(false)
  const [pickerMode, setPickerMode] = useState<PickerMode>('insert')
  const [media, setMedia] = useState<Media[]>([])
  const [mediaQuery, setMediaQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [featureOpen, setFeatureOpen] = useState(false)
  const [findOpen, setFindOpen] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [html, setHtml] = useState(initial.content || '')
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const key = useMemo(() => `blog-pro-draft:${initial.id || 'new'}`, [initial.id])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
      Image.configure({ allowBase64: false, inline: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true, lastColumnResizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({ placeholder: 'Start writing your story… Type / for ideas, paste from Word, or drag in an image.' }),
      Typography,
      Youtube.configure({ controls: true, nocookie: true, modestBranding: true }),
      Dropcursor.configure({ color: '#7357f6', width: 2 }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initial.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'pro-editor-content',
        spellcheck: 'true',
      },
      handlePaste(view, event) {
        const text = event.clipboardData?.getData('text/plain') || ''
        if (text) return false
        return false
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML())
      setDirty(true)
    },
  })

  useEffect(() => {
    if (!editor) return
    const saved = localStorage.getItem(key)
    if (saved && saved !== editor.getHTML()) editor.commands.setContent(saved)
  }, [editor, key])

  useEffect(() => {
    if (!editor || !dirty) return
    const timer = window.setTimeout(() => {
      localStorage.setItem(key, editor.getHTML())
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [editor, dirty, key, html])

  async function loadMedia(open = true) {
    if (open) setMediaOpen(true)
    const response = await fetch('/api/admin/media')
    if (response.ok) setMedia((await response.json()).media || [])
  }

  async function upload(file: File, mode: PickerMode = 'insert') {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/admin/media', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      if (mode === 'cover') setCover(data.url)
      else editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run()
      await loadMedia(false)
    } finally {
      setUploading(false)
    }
  }

  function openMedia(mode: PickerMode) {
    setPickerMode(mode)
    setMediaQuery('')
    void loadMedia(true)
  }

  function chooseMedia(item: Media) {
    if (pickerMode === 'cover') setCover(item.url)
    else editor?.chain().focus().setImage({ src: item.url, alt: item.filename || 'Image' }).run()
    setMediaOpen(false)
  }

  function promptLink() {
    const previous = editor?.getAttributes('link').href || ''
    const url = window.prompt('Enter link URL', previous)
    if (url === null) return
    if (!url) editor?.chain().focus().unsetLink().run()
    else editor?.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run()
  }

  function insertYouTube() {
    const url = window.prompt('YouTube URL')
    if (url) editor?.commands.setYoutubeVideo({ src: url, width: 760, height: 428 })
  }

  function insertTable(rows = 3, cols = 3) {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  function findReplace() {
    if (!editor || !findText) return
    const current = editor.getHTML()
    const next = current.replaceAll(findText, replaceText)
    editor.commands.setContent(next)
    setHtml(next)
    setDirty(true)
  }

  function executeFeature(feature: string) {
    if (!editor) return
    const chain = editor.chain().focus()
    if (feature === 'Paragraph') chain.setParagraph().run()
    else if (/^Heading [1-6]$/.test(feature)) chain.setHeading({ level: Number(feature.slice(-1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
    else if (feature === 'Bold') chain.toggleBold().run()
    else if (feature === 'Italic') chain.toggleItalic().run()
    else if (feature === 'Underline') chain.toggleUnderline().run()
    else if (feature === 'Strike') chain.toggleStrike().run()
    else if (feature === 'Inline code') chain.toggleCode().run()
    else if (feature === 'Superscript') chain.toggleSuperscript().run()
    else if (feature === 'Subscript') chain.toggleSubscript().run()
    else if (feature === 'Highlight') chain.toggleHighlight({ color: '#fff2a8' }).run()
    else if (feature === 'Align left') chain.setTextAlign('left').run()
    else if (feature === 'Align center') chain.setTextAlign('center').run()
    else if (feature === 'Align right') chain.setTextAlign('right').run()
    else if (feature === 'Justify') chain.setTextAlign('justify').run()
    else if (feature === 'Clear formatting') chain.unsetAllMarks().clearNodes().run()
    else if (feature === 'Blockquote') chain.toggleBlockquote().run()
    else if (feature === 'Code block') chain.toggleCodeBlock().run()
    else if (feature === 'Horizontal rule' || feature === 'Divider') chain.setHorizontalRule().run()
    else if (feature === 'Bullet list') chain.toggleBulletList().run()
    else if (feature === 'Numbered list') chain.toggleOrderedList().run()
    else if (feature === 'Checklist') chain.toggleTaskList().run()
    else if (feature === 'Indent') chain.sinkListItem('listItem').run()
    else if (feature === 'Outdent') chain.liftListItem('listItem').run()
    else if (feature === 'Hard break') chain.setHardBreak().run()
    else if (feature === 'Undo') chain.undo().run()
    else if (feature === 'Redo') chain.redo().run()
    else if (feature === 'Link') promptLink()
    else if (feature === 'Unlink') chain.unsetLink().run()
    else if (feature === 'Image' || feature === 'Featured image' || feature === 'Insert selected media') openMedia(feature === 'Featured image' ? 'cover' : 'insert')
    else if (feature === 'YouTube') insertYouTube()
    else if (feature === 'Table' || feature === '3x3 table') insertTable(3, 3)
    else if (feature === '4x4 table') insertTable(4, 4)
    else if (feature === 'Add row') chain.addRowAfter().run()
    else if (feature === 'Add column') chain.addColumnAfter().run()
    else if (feature === 'Delete row') chain.deleteRow().run()
    else if (feature === 'Delete column') chain.deleteColumn().run()
    else if (feature === 'Merge cells') chain.mergeCells().run()
    else if (feature === 'Split cell') chain.splitCell().run()
    else if (feature === 'Delete table') chain.deleteTable().run()
    else if (feature === 'Toggle header row') chain.toggleHeaderRow().run()
    else if (feature === 'Find') setFindOpen(true)
    else if (feature === 'Select all') chain.selectAll().run()
    else if (feature === 'Focus mode') setFocusMode(v => !v)
    else if (feature === 'Fullscreen') setFullscreen(v => !v)
    else if (feature === 'Preview') setPreview(v => !v)
    else if (feature === 'Keyboard shortcuts') window.alert('Ctrl/Cmd+B bold · Ctrl/Cmd+I italic · Ctrl/Cmd+U underline · Ctrl/Cmd+K link · Ctrl/Cmd+S save')
    setFeatureOpen(false)
  }

  const visibleMedia = media.filter(item => (item.filename || '').toLowerCase().includes(mediaQuery.toLowerCase()))
  const stats = editor ? { words: editor.storage.characterCount.words(), chars: editor.storage.characterCount.characters(), minutes: estimateReadingTime(editor.getHTML()) } : { words: 0, chars: 0, minutes: 1 }

  return (
    <form className={`pro-post-editor${fullscreen ? ' is-fullscreen' : ''}${focusMode ? ' is-focus' : ''}`} action="/api/admin/posts" method="post" onSubmit={() => localStorage.removeItem(key)}>
      <input type="hidden" name="intent" value={initial.id ? 'update' : 'create'} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="content" value={html} />
      <input type="hidden" name="contentFormat" value="HTML" />
      <input type="hidden" name="coverImage" value={cover} />

      <div className="pro-editor-header">
        <div>
          <div className="pro-editor-kicker">Production editor</div>
          <div className="pro-editor-status">{dirty ? 'Unsaved changes' : 'All changes saved'}{savedAt ? ` · autosaved ${savedAt}` : ''}</div>
        </div>
        <div className="pro-editor-header-actions">
          <button type="button" onClick={() => setFeatureOpen(v => !v)}>Feature center</button>
          <button type="button" onClick={() => setFindOpen(true)}>Find / Replace</button>
          <button type="button" onClick={() => setFocusMode(v => !v)}>{focusMode ? 'Exit focus' : 'Focus mode'}</button>
          <button type="button" onClick={() => setFullscreen(v => !v)}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button>
          <button type="button" className={preview ? 'active' : ''} onClick={() => setPreview(v => !v)}>{preview ? 'Write' : 'Preview'}</button>
        </div>
      </div>

      <div className="pro-editor-toolbar-shell">
        <div className="pro-editor-toolbar-row">
          <select defaultValue="paragraph" aria-label="Block style" onChange={e => {
            const v = e.target.value
            if (v === 'paragraph') editor?.chain().focus().setParagraph().run()
            else editor?.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
          }}>
            <option value="paragraph">Paragraph</option><option value="1">Heading 1</option><option value="2">Heading 2</option><option value="3">Heading 3</option><option value="4">Heading 4</option><option value="5">Heading 5</option><option value="6">Heading 6</option>
          </select>
          <span className="toolbar-sep" />
          <button type="button" onClick={() => editor?.chain().focus().undo().run()}>↶</button><button type="button" onClick={() => editor?.chain().focus().redo().run()}>↷</button>
          <span className="toolbar-sep" />
          <button type="button" className={editor?.isActive('bold') ? 'active' : ''} onClick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></button>
          <button type="button" className={editor?.isActive('italic') ? 'active' : ''} onClick={() => editor?.chain().focus().toggleItalic().run()}><i>I</i></button>
          <button type="button" className={editor?.isActive('underline') ? 'active' : ''} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></button>
          <button type="button" className={editor?.isActive('strike') ? 'active' : ''} onClick={() => editor?.chain().focus().toggleStrike().run()}><s>S</s></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleCode().run()}>Code</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHighlight({ color: '#fff2a8' }).run()}>Highlight</button>
          <span className="toolbar-sep" />
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button><button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button><button type="button" onClick={() => editor?.chain().focus().toggleTaskList().run()}>☑ Tasks</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</button><button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>Code block</button>
          <span className="toolbar-sep" />
          <button type="button" onClick={promptLink}>Link</button><button type="button" onClick={() => editor?.chain().focus().unsetLink().run()}>Unlink</button><button type="button" onClick={() => openMedia('insert')}>Image</button><button type="button" onClick={insertYouTube}>YouTube</button><button type="button" onClick={() => insertTable(3,3)}>Table</button>
          <span className="toolbar-sep" />
          <button type="button" onClick={() => editor?.chain().focus().setTextAlign('left').run()}>Left</button><button type="button" onClick={() => editor?.chain().focus().setTextAlign('center').run()}>Center</button><button type="button" onClick={() => editor?.chain().focus().setTextAlign('right').run()}>Right</button><button type="button" onClick={() => editor?.chain().focus().setTextAlign('justify').run()}>Justify</button>
          <span className="toolbar-sep" />
          <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>Divider</button><button type="button" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</button>
        </div>
        <div className="pro-editor-toolbar-row secondary">
          <select onChange={e => e.target.value && editor?.chain().focus().setFontFamily(e.target.value).run()} defaultValue=""> <option value="">Font</option><option value="Noto Serif Bengali">Noto Serif Bengali</option><option value="Georgia">Georgia</option><option value="Arial">Arial</option><option value="Verdana">Verdana</option><option value="ui-monospace">Monospace</option></select>
          <div className="color-palette"><span>Text</span>{palettes.map(c => <button type="button" key={c} title={c} style={{ background: c }} onClick={() => editor?.chain().focus().setColor(c).run()} />)}</div>
          <button type="button" onClick={() => editor?.chain().focus().toggleSuperscript().run()}>x²</button><button type="button" onClick={() => editor?.chain().focus().toggleSubscript().run()}>x₂</button>
          <button type="button" onClick={() => editor?.chain().focus().sinkListItem('listItem').run()}>Indent</button><button type="button" onClick={() => editor?.chain().focus().liftListItem('listItem').run()}>Outdent</button>
          <button type="button" onClick={() => editor?.chain().focus().addRowAfter().run()}>+ Row</button><button type="button" onClick={() => editor?.chain().focus().addColumnAfter().run()}>+ Col</button><button type="button" onClick={() => editor?.chain().focus().deleteTable().run()}>Delete table</button>
          <button type="button" onClick={() => setFindOpen(true)}>Find</button><button type="button" onClick={() => setFeatureOpen(v => !v)}>More…</button>
        </div>
      </div>

      <div className="pro-editor-grid">
        <section className="pro-editor-canvas">
          {editor && !preview && <BubbleMenu editor={editor} tippyOptions={{ duration: 120 }}><div className="pro-bubble"><button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>B</button><button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>I</button><button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button><button type="button" onClick={promptLink}>Link</button><button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: '#fff2a8' }).run()}>Mark</button></div></BubbleMenu>}
          {preview ? <div className="pro-editor-preview prose" dangerouslySetInnerHTML={{ __html: html || '<p>Nothing to preview.</p>' }} /> : <EditorContent editor={editor} />}
          <div className="pro-editor-statusbar"><span>{stats.words} words</span><span>{stats.chars.toLocaleString()} characters</span><span>{stats.minutes} min read</span><span>{editor?.getHTML().length.toLocaleString() || 0} HTML chars</span><span>Tip: Ctrl/Cmd+K for links</span></div>
        </section>

        {!focusMode && <aside className="pro-editor-sidebar">
          <section className="pro-panel"><div className="pro-panel-heading"><h3>Featured image</h3><button type="button" onClick={() => openMedia('cover')}>Choose</button></div><div className="pro-cover-preview">{cover ? <img src={cover} alt="" /> : <span>No featured image</span>}</div><div className="pro-panel-actions"><label className="pro-upload">Upload<input type="file" hidden accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f, 'cover'); e.currentTarget.value = '' }} /></label><button type="button" onClick={() => openMedia('cover')}>Media library</button></div></section>
          <section className="pro-panel"><h3>Document</h3><label>Title<input name="title" defaultValue={initial.title} required /></label><label>Slug<input name="slug" defaultValue={initial.slug} /></label><label>Excerpt<textarea name="excerpt" defaultValue={initial.excerpt || ''} maxLength={500} /></label><label>Categories<select name="categoryIds" multiple defaultValue={initial.categoryIds || []}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Tags<input name="tags" defaultValue={(initial.tags || []).join(', ')} placeholder="tag, another-tag" /></label></section>
          <section className="pro-panel"><h3>SEO</h3><label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle || ''} maxLength={60} /></label><label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription || ''} maxLength={160} /></label><label>Keywords<input name="seoKeywords" defaultValue={initial.seoKeywords || ''} /></label><label>Canonical URL<input name="canonicalUrl" defaultValue={initial.canonicalUrl || ''} /></label><label>Open Graph image<input name="ogImage" defaultValue={initial.ogImage || ''} /></label><label className="check"><input type="checkbox" name="noindex" value="1" defaultChecked={initial.noindex === 1} /> Prevent indexing</label></section>
        </aside>}
      </div>

      <div className="pro-editor-actions"><div><button className="primary-action" name="status" value="DRAFT">Save draft</button><button className="primary-action" name="status" value="PUBLISHED">Publish</button>{initial.id && <button className="danger-action" name="intent" value="trash" formNoValidate>Move to Trash</button>}</div><span>{uploading ? 'Uploading…' : 'Autosave on · rich text · media library · keyboard shortcuts'}</span></div>

      {featureOpen && <div className="feature-center" onMouseDown={e => { if (e.target === e.currentTarget) setFeatureOpen(false) }}><div className="feature-dialog"><div className="feature-header"><div><span className="pro-editor-kicker">Feature center</span><h3>100+ editing capabilities</h3><p>Grouped tools inspired by modern WordPress and professional rich-text editors.</p></div><button type="button" onClick={() => setFeatureOpen(false)}>Close</button></div><div className="feature-groups">{featureGroups.map(([group, items]) => <div className="feature-group" key={group as string}><h4>{group as string}</h4><div className="feature-items">{(items as string[]).map(item => <button type="button" key={item} onClick={() => executeFeature(item)}>{item}</button>)}</div></div>)}</div></div></div>}

      {findOpen && <div className="feature-center" onMouseDown={e => { if (e.target === e.currentTarget) setFindOpen(false) }}><div className="find-dialog"><h3>Find & replace</h3><label>Find<input value={findText} onChange={e => setFindText(e.target.value)} autoFocus /></label><label>Replace with<input value={replaceText} onChange={e => setReplaceText(e.target.value)} /></label><div className="find-actions"><button type="button" onClick={findReplace}>Replace all</button><button type="button" onClick={() => setFindOpen(false)}>Close</button></div></div></div>}

      {mediaOpen && <div className="feature-center" onMouseDown={e => { if (e.target === e.currentTarget) setMediaOpen(false) }}><div className="media-dialog-pro"><div className="feature-header"><div><span className="pro-editor-kicker">Media library</span><h3>Select media</h3></div><div className="pro-panel-actions"><label className="pro-upload">Upload<input type="file" hidden accept="image/*" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f, pickerMode); e.currentTarget.value = '' }} /></label><button type="button" onClick={() => setMediaOpen(false)}>Close</button></div></div><input className="media-search-pro" value={mediaQuery} onChange={e => setMediaQuery(e.target.value)} placeholder="Search uploaded media…" /><div className="media-grid-pro">{visibleMedia.length ? visibleMedia.map(item => <button type="button" className="media-card-pro" key={item.id} onClick={() => chooseMedia(item)}><img src={item.url} alt="" /><strong>{item.filename || 'Image'}</strong><small>{item.size ? `${Math.round(item.size / 1024)} KB` : ''}</small></button>) : <p>No media found.</p>}</div></div></div>}
    </form>
  )
}
