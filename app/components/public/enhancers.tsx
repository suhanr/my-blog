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
