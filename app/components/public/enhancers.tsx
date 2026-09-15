'use client'

import { useEffect, useState } from 'react'

/** Reveals every .reveal element as it scrolls into view. Mount once. */
export function RevealInit() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  })
  return null
}

/** Thin progress bar showing how far the article has been read. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setPct(max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return <div className="mag-progress" style={{ width: `${pct}%` }} aria-hidden="true" />
}

export function ShareActions({ title, url, compact = false }: { title: string; url: string; compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'copied'>('idle')

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        textarea.remove()
      }
      setStatus('copied')
      window.setTimeout(() => setStatus('idle'), 1800)
    } catch {
      setStatus('idle')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url })
      } catch (error) {
        if ((error as DOMException)?.name !== 'AbortError') return
      }
      return
    }
    await copyLink()
  }

  return (
    <div className={compact ? 'mag-share mag-share-compact' : 'mag-share'}>
      <style>{`.site-public .mag-share button:first-child::before { content:none !important; display:none !important; } .site-public .mag-share button:first-child svg { flex:0 0 auto; display:block; } .site-public .mag-share button:first-child { background:#d92b2b !important; background-color:#d92b2b !important; background-image:none !important; border-color:#d92b2b !important; color:#fff !important; } .site-public .mag-share button:first-child:hover { background:#b91f1f !important; background-color:#b91f1f !important; border-color:#b91f1f !important; color:#fff !important; } .site-public .mag-share button:last-child { border-color:#d92b2b !important; } .site-public .mag-share button:last-child:hover { border-color:#d92b2b !important; color:#d92b2b !important; } .site-public .mag-share-compact { gap:7px; margin-top:12px; width:auto !important; } .site-public .mag-share-compact button { min-height:36px; min-width:0; flex:0 0 auto !important; padding:7px 12px; gap:6px; font-size:13px; box-shadow:none; } .site-public .mag-share-compact button svg { width:15px; height:15px; } .site-public .mag-share-compact button:hover { transform:translateY(-1px); }`}</style>
      <button type="button" onClick={share} aria-label="Share this article" style={{ backgroundColor: '#d92b2b', borderColor: '#d92b2b', color: '#fff' }}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.5" />
          <path d="m8.2 13.2 7.6 4.5" />
        </svg>
        {compact ? 'শেয়ার' : 'শেয়ার করুন'}
      </button>
      <button type="button" onClick={copyLink} aria-label="Copy article link" style={{ borderColor: '#d92b2b' }}>
        {compact ? (status === 'copied' ? 'কপি হয়েছে' : 'লিংক কপি') : (status === 'copied' ? 'লিংক কপি হয়েছে' : 'লিংক কপি করুন')}
      </button>
    </div>
  )
}

/** Click any image in the article body to view it full-screen. */
export function Lightbox() {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.mag-article-body')) {
        setSrc((target as HTMLImageElement).currentSrc || (target as HTMLImageElement).src)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSrc(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [src])
  if (!src) return null
  return (
    <div className="mag-lightbox" onClick={() => setSrc(null)} role="dialog" aria-modal="true">
      <img src={src} alt="" />
    </div>
  )
}
