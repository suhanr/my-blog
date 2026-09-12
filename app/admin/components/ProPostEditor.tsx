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
          <div className="ck-editor-post-kicker">Publishing</div>
          <div className="ck-editor-post-status">{dirty ? 'Unsaved changes' : 'All changes saved'}{savedAt ? ` · autosaved ${savedAt}` : ''}</div>
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
            <div className="ck-editor-post-card-title">Document</div>
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
            <div className="ck-editor-post-card-title">Featured image</div>
            {cover && <img className="ck-editor-cover" src={cover} alt="" />}
            <label>Image URL<input value={cover} onChange={e => setCover(e.target.value)} placeholder="https://..." /></label>
          </section>

          <section className="ck-editor-post-card">
            <div className="ck-editor-post-card-title">SEO</div>
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
        <div>
          <button className="primary-action" name="status" value="DRAFT">Save draft</button>
          <button className="publish-action" name="status" value="PUBLISHED">Publish</button>
          {initial.id && <button className="danger-action" name="intent" value="trash" formNoValidate>Move to Trash</button>}
        </div>
      </div>

      <style>{`
        .ck-editor-post-form {
          width: 100%;
          background: #fff;
          border: 1px solid #d9dddf;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 10px 32px rgba(20, 26, 31, .06);
        }
        .ck-editor-post-form--fullscreen {
          position: fixed;
          inset: 0;
          z-index: 3000;
          border-radius: 0;
          overflow: auto;
          background: #f4f5f3;
        }
        .ck-editor-post-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
          border-bottom: 1px solid #e3e6e7;
          background: #fff;
        }
        .ck-editor-post-kicker {
          margin-bottom: 4px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #7357f6;
        }
        .ck-editor-post-status {
          font-size: 12px;
          color: #7a8288;
        }
        .ck-editor-post-topbar button {
          border: 1px solid #cfd4d7;
          background: #fff;
          color: #20252a;
          border-radius: 7px;
          padding: 8px 11px;
          cursor: pointer;
        }
        .ck-editor-post-topbar button:hover { background: #f4f5f5; }
        .ck-editor-post-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 22px;
          padding: 22px;
          align-items: start;
        }
        .ck-editor-post-main { min-width: 0; }
        .ck-editor-post-editor-shell {
          background: #fff;
          border: 1px solid #d8dcdf;
          border-radius: 10px;
          overflow: hidden;
        }
        .ck-editor-post-editor-shell .ck-editor__main > .ck-editor__editable {
          min-height: 560px;
          padding: 24px 28px;
          font-family: 'Noto Serif Bengali', serif;
          font-size: 18px;
          line-height: 1.85;
        }
        .ck-editor-post-editor-shell .ck-toolbar {
          border: 0 !important;
          border-bottom: 1px solid #dfe3e5 !important;
          border-radius: 0 !important;
          background: #fafbfb !important;
        }
        .ck-editor-post-editor-shell .ck-editor__editable.ck-focused {
          border: 0 !important;
          box-shadow: inset 0 0 0 2px rgba(115, 87, 246, .11) !important;
        }
        .ck-editor-post-editor-shell .ck-editor__nested-editable.ck-focused { box-shadow: none !important; }
        .ck-editor-post-editor-shell .ck-content h1,
        .ck-editor-post-editor-shell .ck-content h2,
        .ck-editor-post-editor-shell .ck-content h3 {
          line-height: 1.25;
        }
        .ck-editor-post-statusbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 8px 4px 0;
          color: #7a838a;
          font-size: 11px;
        }
        .ck-editor-post-statusbar .ck-word-count {
          display: flex;
          gap: 14px;
          align-items: center;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: #7a838a;
          font-size: 11px;
        }
        .ck-editor-post-sidebar {
          display: grid;
          gap: 14px;
          min-width: 0;
          position: sticky;
          top: 18px;
          max-height: calc(100vh - 36px);
          overflow: auto;
        }
        .ck-editor-post-card {
          padding: 16px;
          border: 1px solid #dfe3e5;
          border-radius: 10px;
          background: #f8f9f9;
        }
        .ck-editor-post-card-title {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 700;
          color: #20252a;
        }
        .ck-editor-post-card label {
          display: grid;
          gap: 6px;
          margin: 11px 0;
          color: #59626a;
          font-size: 12px;
        }
        .ck-editor-post-card input,
        .ck-editor-post-card textarea,
        .ck-editor-post-card select {
          width: 100%;
          min-width: 0;
          border: 1px solid #cfd5d8;
          border-radius: 7px;
          background: #fff;
          color: #20252a;
          padding: 9px 10px;
          outline: none;
        }
        .ck-editor-post-card input:focus,
        .ck-editor-post-card textarea:focus,
        .ck-editor-post-card select:focus {
          border-color: #9ca5ab;
          box-shadow: 0 0 0 3px rgba(115, 87, 246, .08);
        }
        .ck-editor-post-card textarea {
          min-height: 96px;
          resize: vertical;
        }
        .ck-editor-post-card select[multiple] {
          min-height: 138px;
        }
        .ck-editor-cover {
          display: block;
          width: 100%;
          max-height: 190px;
          object-fit: cover;
          margin-bottom: 10px;
          border-radius: 8px;
        }
        .ck-editor-check {
          display: flex !important;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 8px;
        }
        .ck-editor-check input { width: auto !important; }
        .ck-editor-post-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-top: 1px solid #dfe3e5;
          background: #fafbfb;
        }
        .ck-editor-post-actions > div { display: flex; gap: 8px; flex-wrap: wrap; }
        .ck-editor-post-actions button {
          border: 1px solid #1f2933;
          border-radius: 7px;
          padding: 9px 14px;
          cursor: pointer;
          font-weight: 600;
        }
        .ck-editor-post-actions .primary-action {
          background: #fff;
          color: #1f2933;
        }
        .ck-editor-post-actions .publish-action {
          background: #1f2933;
          color: #fff;
        }
        .ck-editor-post-actions .danger-action {
          border-color: #8d2d2d;
          background: #8d2d2d;
          color: #fff;
        }
        .ck-editor-post-form .ck.ck-dropdown__panel,
        .ck-editor-post-form .ck.ck-list { z-index: 3100; }
        @media (max-width: 1100px) {
          .ck-editor-post-grid { grid-template-columns: 1fr; }
          .ck-editor-post-sidebar { position: static; max-height: none; overflow: visible; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 760px) {
          .ck-editor-post-topbar { align-items: flex-start; }
          .ck-editor-post-grid { padding: 12px; gap: 14px; }
          .ck-editor-post-sidebar { grid-template-columns: 1fr; }
          .ck-editor-post-editor-shell .ck-editor__main > .ck-editor__editable { min-height: 420px; padding: 18px; }
          .ck-editor-post-actions { padding: 12px; }
        }
      `}</style>
    </form>
  )
}
