import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { getCategories, getHeaderMenu } from '@/lib/db'
import { SITE, SITE_NAME } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `পেজ পাওয়া যায়নি | ${SITE_NAME}`,
  description: 'আপনি যে পাতাটি খুঁজছেন সেটি পাওয়া যায়নি।',
  alternates: { canonical: `${SITE}/404/` },
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  let menu: Awaited<ReturnType<typeof getHeaderMenu>> = []

  try {
    ;[categories, menu] = await Promise.all([getCategories(), getHeaderMenu()])
  } catch {
    // Keep the 404 page usable even if navigation data is temporarily unavailable.
  }

  return (
    <div className="site-public not-found-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .not-found-page,
        .not-found-page * {
          font-family: 'Noto Serif Bengali', serif !important;
        }
        .not-found-page {
          min-height: 100vh;
          color: var(--fg);
          background: var(--bg);
          overflow: hidden;
        }
        .not-found-stage {
          width: min(1320px, calc(100% - 48px));
          margin: 0 auto;
          min-height: calc(100vh - 150px);
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(420px, .98fr);
          align-items: center;
          gap: clamp(50px, 7vw, 110px);
          padding: clamp(70px, 10vw, 130px) 0 clamp(80px, 10vw, 130px);
          border-top: 1px solid var(--line-2);
          border-bottom: 1px solid var(--line-2);
        }
        .not-found-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          color: var(--accent);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .not-found-kicker::before {
          content: '';
          width: 28px;
          height: 1px;
          background: currentColor;
        }
        .not-found-number {
          margin: 0;
          color: var(--fg);
          font-size: clamp(105px, 17vw, 220px);
          line-height: .75;
          letter-spacing: -.085em;
          font-weight: 500;
        }
        .not-found-number span {
          color: var(--accent);
        }
        .not-found-heading {
          max-width: 680px;
          margin: 34px 0 14px;
          font-size: clamp(32px, 4vw, 58px);
          line-height: 1.04;
          letter-spacing: -.04em;
          font-weight: 700;
        }
        .not-found-copy {
          max-width: 620px;
          margin: 0;
          color: var(--muted);
          font-size: 16px;
          line-height: 1.9;
        }
        .not-found-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 28px;
        }
        .not-found-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 18px;
          border: 1px solid var(--fg);
          border-radius: 999px;
          color: var(--fg);
          background: transparent;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: background .18s ease, color .18s ease, transform .18s ease;
        }
        .not-found-action:hover {
          transform: translateY(-2px);
          background: var(--fg);
          color: var(--bg);
        }
        .not-found-action.primary {
          border-color: var(--accent);
          background: var(--accent);
          color: #fff;
        }
        .not-found-action.primary:hover {
          background: transparent;
          color: var(--accent);
        }
        .not-found-art {
          position: relative;
          aspect-ratio: 1 / 1.02;
          display: grid;
          place-items: center;
          border: 1px solid var(--line);
          background: var(--surface);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .not-found-art::before,
        .not-found-art::after {
          content: '';
          position: absolute;
          background: var(--line);
          pointer-events: none;
        }
        .not-found-art::before {
          width: 1px;
          height: 100%;
          left: 16%;
          top: 0;
        }
        .not-found-art::after {
          width: 100%;
          height: 1px;
          left: 0;
          top: 54%;
        }
        .not-found-art-label {
          position: absolute;
          top: 22px;
          right: 22px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .16em;
        }
        .not-found-art-mark {
          position: relative;
          width: 72%;
          aspect-ratio: 1;
        }
        .not-found-art-mark::before,
        .not-found-art-mark::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 84%;
          height: 3px;
          border-radius: 999px;
          background: var(--accent);
          transform-origin: center;
        }
        .not-found-art-mark::before {
          transform: translate(-50%, -50%) rotate(38deg);
        }
        .not-found-art-mark::after {
          transform: translate(-50%, -50%) rotate(-38deg);
        }
        .not-found-art-caption {
          position: absolute;
          left: 22px;
          bottom: 20px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .11em;
        }
        @media (max-width: 920px) {
          .not-found-stage {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 56px;
          }
          .not-found-art {
            width: min(100%, 560px);
            justify-self: center;
            order: -1;
          }
        }
        @media (max-width: 560px) {
          .not-found-stage {
            width: min(100% - 32px, 1320px);
            gap: 42px;
            padding: 44px 0 62px;
          }
          .not-found-number {
            font-size: clamp(94px, 27vw, 150px);
          }
          .not-found-heading {
            margin-top: 26px;
            font-size: 31px;
          }
          .not-found-copy {
            font-size: 15px;
          }
          .not-found-art {
            aspect-ratio: 1 / .9;
          }
        }
      ` }} />

      <PublicHeader categories={categories} menu={menu} />

      <main className="not-found-stage" aria-labelledby="not-found-title">
        <section>
          <div className="not-found-kicker">Page Error</div>
          <div className="not-found-number" aria-hidden="true">4<span>0</span>4</div>
          <h1 id="not-found-title" className="not-found-heading">এই পাতাটি আর এখানে নেই।</h1>
          <p className="not-found-copy">
            হয়তো পাতাটি সরিয়ে ফেলা হয়েছে, ঠিকানা বদলেছে, অথবা আপনি এমন একটি লিংকে এসেছেন যা আর সক্রিয় নেই। মূল পাতায় ফিরে গিয়ে নতুন করে খুঁজে দেখতে পারেন।
          </p>
          <div className="not-found-actions">
            <Link href="/" className="not-found-action primary">হোমে ফিরে যান ↗</Link>
            <Link href="/search/" className="not-found-action">সার্চ করুন</Link>
          </div>
        </section>

        <div className="not-found-art" aria-hidden="true">
          <div className="not-found-art-label">NOT FOUND</div>
          <div className="not-found-art-mark" />
          <div className="not-found-art-caption">EDITORIAL / PAGE ERROR</div>
        </div>
      </main>

      <PublicFooter categories={categories} />
    </div>
  )
}
