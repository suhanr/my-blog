'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed-until'
const DISMISS_DAYS = 7

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0)
    if (dismissedUntil > Date.now()) return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent)
    setIos(isIOS)

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      window.setTimeout(() => setShow(true), 1200)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    if (isIOS) window.setTimeout(() => setShow(true), 1200)

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000))
    setShow(false)
    setInstallEvent(null)
  }

  const install = async () => {
    if (!installEvent) return
    const result = await installEvent.prompt()
    setInstallEvent(null)
    if (result.outcome === 'accepted') setShow(false)
  }

  useEffect(() => {
    const onInstalled = () => {
      setShow(false)
      setInstallEvent(null)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [])

  if (!show || (!installEvent && !ios)) return null

  return (
    <aside
      role="dialog"
      aria-label="অ্যাপ ইনস্টল করুন"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 520,
        margin: '0 auto',
        padding: '14px 16px',
        border: '1px solid rgba(0,0,0,.10)',
        borderRadius: 16,
        background: 'rgba(255,255,255,.96)',
        boxShadow: '0 12px 40px rgba(0,0,0,.16)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/android-icon-192x192.png" alt="" width={48} height={48} style={{ borderRadius: 12, flex: '0 0 auto' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>জার্নাল অ্যাপ হিসেবে ইনস্টল করুন</div>
          {ios ? (
            <div style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.5, opacity: .72 }}>শেয়ার বাটনে চাপুন, তারপর Add to Home Screen নির্বাচন করুন।</div>
          ) : (
            <div style={{ marginTop: 3, fontSize: 12.5, lineHeight: 1.5, opacity: .72 }}>হোম স্ক্রিন থেকে দ্রুত খুলতে এই সাইটটি অ্যাপ হিসেবে ইনস্টল করুন।</div>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="বন্ধ করুন"
          style={{
            alignSelf: 'flex-start',
            border: 0,
            background: 'transparent',
            fontSize: 20,
            lineHeight: 1,
            padding: 2,
            cursor: 'pointer',
            opacity: .55,
          }}
        >
          ×
        </button>
      </div>
      {!ios && (
        <button
          type="button"
          onClick={install}
          style={{
            width: '100%',
            marginTop: 11,
            border: 0,
            borderRadius: 10,
            padding: '10px 14px',
            background: '#d92b2b',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ইনস্টল করুন
        </button>
      )}
    </aside>
  )
}
