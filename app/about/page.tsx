import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getHeaderMenu } from '@/lib/db'
import PublicHeader from '@/app/components/public/PublicHeader'
import PublicFooter from '@/app/components/public/PublicFooter'
import { RevealInit } from '@/app/components/public/enhancers'

export const metadata: Metadata = {
  title: 'আমার সম্পর্কে — Journal',
  description: 'সোহানুর রহমান সম্পর্কে জানুন। প্রযুক্তি, গবেষণা, ডেটা, ডিজিটাল সংস্কৃতি ও লেখালেখি নিয়ে কাজের সংক্ষিপ্ত পরিচয়।',
  alternates: { canonical: 'https://blog.suhanurrahman.com/about/' },
}

export default async function AboutPage() {
  const [categories, menu] = await Promise.all([getCategories(), getHeaderMenu()])

  return (
    <div className="site-public">
      <style>{`
        .site-public .about-page { padding: 78px 0 110px; }
        .site-public .about-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(240px, .55fr); gap: 72px; align-items: start; }
        .site-public .about-kicker { margin-bottom: 10px; font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--accent); }
        .site-public .about-title { margin: 0 0 24px; font-size: clamp(42px, 6vw, 76px); line-height: 1.02; letter-spacing: -.04em; color: var(--fg); }
        .site-public .about-lead { max-width: 760px; margin: 0 0 28px; color: var(--muted); font-size: 20px; line-height: 1.85; }
        .site-public .about-body { max-width: 760px; color: var(--fg); font-size: 17px; line-height: 2; }
        .site-public .about-body p { margin: 0 0 20px; }
        .site-public .about-body a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        .site-public .about-side { position: sticky; top: 100px; }
        .site-public .about-card { padding: 22px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow-sm); }
        .site-public .about-card + .about-card { margin-top: 14px; }
        .site-public .about-card h2 { margin: 0 0 12px; font-size: 14px; color: var(--fg); }
        .site-public .about-card p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.8; }
        .site-public .about-links { display: grid; gap: 8px; }
        .site-public .about-links a { color: var(--muted); font-size: 14px; }
        .site-public .about-links a:hover { color: var(--accent); }
        @media (max-width: 820px) {
          .site-public .about-page { padding: 52px 0 80px; }
          .site-public .about-layout { grid-template-columns: 1fr; gap: 40px; }
          .site-public .about-side { position: static; }
          .site-public .about-lead { font-size: 18px; }
        }
      `}</style>

      <PublicHeader categories={categories} menu={menu} />
      <main className="mag-main about-page">
        <div className="mag-container">
          <div className="about-layout">
            <article className="reveal">
              <div className="about-kicker">About</div>
              <h1 className="about-title">সোহানুর রহমান</h1>
              <p className="about-lead">প্রযুক্তি, গবেষণা, ডেটা, ডিজিটাল সংস্কৃতি এবং লেখালেখি নিয়ে কাজ করি। এই জার্নাল আমার শেখা, ভাবনা, অনুসন্ধান আর কাজের নোট রাখার একটি স্বাধীন জায়গা।</p>
              <div className="about-body">
                <p>আমি প্রযুক্তি ও গবেষণার মাঝের জায়গাটায় বেশি স্বচ্ছন্দ। ওয়েব, ডেটা, ডিজিটাল টুল এবং গবেষণাভিত্তিক কাজের মাধ্যমে জটিল বিষয়কে ব্যবহারযোগ্য ও বোধগম্য করে তোলার চেষ্টা করি।</p>
                <p>এই জার্নালে আমি প্রযুক্তি ও এআই, গবেষণা ও ডেটা, ডিজিটাল সংস্কৃতি, অনুসন্ধান এবং নিজের কাজ থেকে পাওয়া অভিজ্ঞতা নিয়ে লিখি। সব লেখা একই ধরনের নয়, তবে একটি বিষয় গুরুত্বপূর্ণ: কৌতূহল, প্রমাণ এবং নিজের মতো করে ভাবার জায়গা।</p>
                <p>আমার পেশাগত কাজ ও অন্যান্য প্রজেক্ট সম্পর্কে জানতে <a href="https://suhanurrahman.com/" target="_blank" rel="noreferrer">suhanurrahman.com</a> দেখতে পারেন।</p>
              </div>
            </article>

            <aside className="about-side reveal">
              <div className="about-card">
                <h2>যে বিষয়গুলো নিয়ে লিখি</h2>
                <p>প্রযুক্তি, এআই, গবেষণা, ডেটা, ডিজিটাল সংস্কৃতি, অনুসন্ধান ও ওয়েব।</p>
              </div>
              <div className="about-card">
                <h2>অনলাইনে</h2>
                <div className="about-links">
                  <a href="https://suhanurrahman.com/" target="_blank" rel="noreferrer">Portfolio ↗</a>
                  <Link href="/search/">জার্নাল সার্চ ↗</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <PublicFooter categories={categories} />
      <RevealInit />
    </div>
  )
}
