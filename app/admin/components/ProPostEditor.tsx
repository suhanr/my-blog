'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  Alignment,
  AutoImage,
  AutoLink,
  AutoMediaEmbed,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  Font,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  ListProperties,
  MediaEmbed,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SimpleUploadAdapter,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'

type Category = { id: string; name: string }
type Tag = { id: string; name: string }
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

const getDraftKey = (id?: string) => `blog-ckeditor-draft:${id || 'new'}`

export default function ProPostEditor({ categories, tags, initial = {} }: { categories: Category[]; tags: Tag[]; initial?: Initial }) {
  const [data, setData] = useState(initial.content || '<p></p>')
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [cover, setCover] = useState(initial.coverImage || '')
  const [fullscreen, setFullscreen] = useState(false)
  const wordCountRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<ClassicEditor | null>(null)
  const draftKey = useMemo(() => getDraftKey(initial.id), [initial.id])

  useEffect(() => {
    const saved = localStorage.getItem(draftKey)
    if (saved) setData(saved)
  }, [draftKey])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, data)
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [data, dirty, draftKey])

  const plugins = [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    CodeBlock,
    Subscript,
    Superscript,
    RemoveFormat,
    Font,
    Highlight,
    Alignment,
    BlockQuote,
    HorizontalLine,
    List,
    ListProperties,
    TodoList,
    Indent,
    Link,
    AutoLink,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload,
    ImageInsert,
    AutoImage,
    SimpleUploadAdapter,
    MediaEmbed,
    AutoMediaEmbed,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    TableColumnResize,
    TableCaption,
    PasteFromOffice,
    FindAndReplace,
    WordCount,
    SpecialCharacters,
    SpecialCharactersEssentials,
    PageBreak,
    SourceEditing,
    SelectAll,
    TextTransformation,
    GeneralHtmlSupport,
  ]

  const toolbar = [
    'undo', 'redo', '|',
    'heading', '|',
    'bold', 'italic', 'underline', 'strikethrough', '|',
    'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
    'alignment', '|',
    'link', 'blockQuote', 'code', 'codeBlock', '|',
    'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent', '|',
    'insertImage', 'mediaEmbed', 'insertTable', 'horizontalLine', 'pageBreak', '|',
    'highlight', 'specialCharacters', 'removeFormat', '|',
    'findAndReplace', 'sourceEditing'
  ]

  const config = {
    licenseKey: 'GPL',
    plugins,
    toolbar,
    placeholder: 'Write your story here…',
    image: {
      toolbar: [
        'imageTextAlternative',
        'toggleImageCaption',
        '|',
        'imageStyle:inline',
        'imageStyle:block',
        'imageStyle:side',
        '|',
        'resizeImage',
      ],
      upload: {
        types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
      },
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },
    fontFamily: {
      options: ['default', 'Noto Serif Bengali', 'Georgia', 'Arial', 'Verdana', 'Courier New'],
    },
    fontSize: {
      options: [10, 12, 14, 'default', 18, 20, 24, 30, 36],
    },
    fontColor: {
      columns: 6,
      documentColors: 6,
    },
    fontBackgroundColor: {
      columns: 6,
      documentColors: 6,
    },
    simpleUpload: {
      uploadUrl: '/api/admin/media',
    },
    htmlSupport: {
      allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
    },
  }

  return (
    <form
      className={`ck-editor-post-form${fullscreen ? ' ck-editor-post-form--fullscreen' : ''}`}
      action="/api/admin/posts"
      method="post"
      onSubmit={() => localStorage.removeItem(draftKey)}
    >
      <input type="hidden" name="intent" value={initial.id ? 'update' : 'create'} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="content" value={data} />
      <input type="hidden" name="contentFormat" value="HTML" />
      <input type="hidden" name="coverImage" value={cover} />

      <div className="ck-editor-post-topbar">
        <div>
          <div className="ck-editor-post-kicker">CKEditor 5</div>
          <div className="ck-editor-post-status">{dirty ? 'Unsaved changes' : 'Ready'}{savedAt ? ` · autosaved ${savedAt}` : ''}</div>
        </div>
        <button type="button" onClick={() => setFullscreen(v => !v)}>
          {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div className="ck-editor-post-grid">
        <main className="ck-editor-post-main">
          <div className="ck-editor-post-editor-shell">
            <CKEditor
              editor={ClassicEditor}
              data={data}
              config={config}
              onReady={(editor) => {
                editorRef.current = editor
                const wordCount = editor.plugins.get('WordCount')
                if (wordCountRef.current && !wordCountRef.current.firstChild) {
                  wordCountRef.current.appendChild(wordCount.wordCountContainer)
                }
              }}
              onChange={(_, editor) => {
                setData(editor.getData())
                setDirty(true)
              }}
              onAfterDestroy={() => {
                editorRef.current = null
                if (wordCountRef.current) wordCountRef.current.innerHTML = ''
              }}
            />
          </div>
          <div className="ck-editor-post-statusbar">
            <div ref={wordCountRef} />
            <span>{dirty ? 'Autosave enabled' : 'All changes saved'}</span>
          </div>
        </main>

        <aside className="ck-editor-post-sidebar">
          <section className="ck-editor-post-card">
            <h3>Document</h3>
            <label>Title<input name="title" defaultValue={initial.title} required /></label>
            <label>Slug<input name="slug" defaultValue={initial.slug} /></label>
            <label>Excerpt<textarea name="excerpt" defaultValue={initial.excerpt || ''} maxLength={500} /></label>
            <label>
              Categories
              <select name="categoryIds" multiple defaultValue={initial.categoryIds || []}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Tags<input name="tags" defaultValue={(initial.tags || []).join(', ')} placeholder="tag, another-tag" /></label>
          </section>

          <section className="ck-editor-post-card">
            <h3>Featured image</h3>
            {cover && <img className="ck-editor-cover" src={cover} alt="" />}
            <label>Image URL<input value={cover} onChange={e => setCover(e.target.value)} placeholder="https://..." /></label>
          </section>

          <section className="ck-editor-post-card">
            <h3>SEO</h3>
            <label>SEO title<input name="seoTitle" defaultValue={initial.seoTitle || ''} maxLength={60} /></label>
            <label>Meta description<textarea name="seoDescription" defaultValue={initial.seoDescription || ''} maxLength={160} /></label>
            <label>Keywords<input name="seoKeywords" defaultValue={initial.seoKeywords || ''} /></label>
            <label>Canonical URL<input name="canonicalUrl" defaultValue={initial.canonicalUrl || ''} /></label>
            <label>Open Graph image<input name="ogImage" defaultValue={initial.ogImage || ''} /></label>
            <label className="ck-editor-check"><input type="checkbox" name="noindex" value="1" defaultChecked={initial.noindex === 1} /> Prevent indexing</label>
          </section>
        </aside>
      </div>

      <div className="ck-editor-post-actions">
        <button className="primary-action" name="status" value="DRAFT">Save draft</button>
        <button className="primary-action" name="status" value="PUBLISHED">Publish</button>
        {initial.id && <button className="danger-action" name="intent" value="trash" formNoValidate>Move to Trash</button>}
      </div>
    </form>
  )
}
