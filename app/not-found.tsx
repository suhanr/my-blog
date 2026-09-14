import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .not-found-page {
          --nf-bg: var(--bg, #f7f4ee);
          --nf-fg: var(--fg, #171717);
          --nf-muted: var(--muted, #6f6a62);
          --nf-line: var(--line-2, rgba(23,23,23,.10));
          --nf-accent: var(--accent, #b42318);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--nf-bg);
          color: var(--nf-fg);
          overflow: hidden;
        }
        .not-found-page * { box-sizing: border-box; }
        .not-found-top {
          width: min(1240px, calc(100% - 48px));
          margin: 0 auto;
          padding: 26px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 1px solid var(--nf-line);
        }
        .not-found-brand {
          color: var(--nf-fg);
          text-decoration: none;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -.03em;
        }
        .not-found-brand b { color: var(--nf-accent); }
        .not-found-meta {
          margin: 0;
          color: var(--nf-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .not-found-main {
          width: min(1240px, calc(100% - 48px));
          flex: 1;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          align-items: center;
          gap: clamp(44px, 8vw, 120px);
          padding: clamp(72px, 10vw, 150px) 0 clamp(84px, 11vw, 150px);
        }
        .not-found-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          color: var(--nf-accent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .not-found-kicker::before {
          content: '';
          width: 30px;
          height: 1px;
          background: currentColor;
        }
        .not-found-title {
          margin: 0;
          max-width: 760px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(84px, 17vw, 220px);
          line-height: .78;
          letter-spacing: -.075em;
          font-weight: 400;
          color: var(--nf-fg);
        }
        .not-found-title span { color: var(--nf-accent); }
        .not-found-heading {
          margin: 42px 0 14px;
          max-width: 560px;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(31px, 4vw, 54px);
          line-height: 1.02;
          letter-spacing: -.045em;
          font-weight: 600;
        }
        .not-found-copy {
          max-width: 600px;
          margin: 0;
          color: var(--nf-muted);
          font-size: 16px;
          line-height: 1.85;
        }
        .not-found-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 30px;
        }
        .not-found-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 17px;
          border: 1px solid var(--nf-fg);
          border-radius: 999px;
          color: var(--nf-fg);
          background: transparent;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: background .18s ease, color .18s ease, transform .18s ease;
        }
        .not-found-action:hover { transform: translateY(-2px); background: var(--nf-fg); color: var(--nf-bg); }
        .not-found-action.primary { border-color: var(--nf-accent); background: var(--nf-accent); color: #fff; }
        .not-found-action.primary:hover { background: transparent; color: var(--nf-accent); }
        .not-found-art {
          position: relative;
          min-height: 460px;
          display: grid;
          place-items: center;
        }
        .not-found-art::before,
        .not-found-art::after {
          content: '';
          position: absolute;
          background: var(--nf-line);
          pointer-events: none;
        }
        .not-found-art::before { width: 1px; height: 100%; left: 10%; top: 0; }
        .not-found-art::after { width: 100%; height: 1px; left: 0; top: 50%; }
        .not-found-card {
          position: relative;
          width: min(100%, 500px);
          aspect-ratio: 1 / 1.08;
          border: 1px solid var(--nf-line);
          background:
            linear-gradient(135deg, transparent 0 49.8%, var(--nf-line) 49.8% 50.2%, transparent 50.2% 100%),
            var(--nf-bg);
          box-shadow: 0 24px 70px rgba(20, 18, 15, .08);
          overflow: hidden;
        }
        .not-found-card::before {
          content: 'NOT FOUND';
          position: absolute;
          top: 22px;
          right: 22px;
          color: var(--nf-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .18em;
        }
        .not-found-card::after {
          content: 'EDITORIAL / 404';
          position: absolute;
          left: 22px;
          bottom: 22px;
          color: var(--nf-muted);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
        }
        .not-found-card-number {
          position: absolute;
          inset: 50% auto auto 50%;
          transform: translate(-50%, -55%);
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(130px, 20vw, 235px);
          line-height: .8;
          letter-spacing: -.09em;
          color: var(--nf-fg);
          font-weight: 400;
          white-space: nowrap;
        }
        .not-found-card-number span { color: var(--nf-accent); }
        .not-found-footer {
          width: min(1240px, calc(100% - 48px));
          margin: 0 auto;
          padding: 18px 0 24px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid var(--nf-line);
          color: var(--nf-muted);
          font-size: 11px;
          letter-spacing: .04em;
        }
        @media (max-width: 820px) {
          .not-found-top,
          .not-found-main,
          .not-found-footer { width: min(100% - 32px, 1240px); }
          .not-found-main { grid-template-columns: 1fr; padding-top: 58px; }
          .not-found-art { min-height: 360px; order: -1; }
          .not-found-card { width: min(100%, 400px); }
          .not-found-heading { margin-top: 30px; }
        }
        @media (max-width: 520px) {
          .not-found-top { padding: 20px 0; }
          .not-found-meta { display: none; }
          .not-found-main { padding-bottom: 62px; }
          .not-found-art { min-height: 290px; }
          .not-found-card-number { font-size: 125px; }
          .not-found-footer { flex-direction: column; }
        }
      ` }} />

      <header className="not-found-top">
        <Link href="/" className="not-found-brand">
          সোহানুর <b>রহমান</b>
        </Link>
        <p className="not-found-meta">Independent Journal · Bangladesh</p>
      </header>

      <section className="not-found-main" aria-labelledby="not-found-title">
        <div>
          <div className="not-found-kicker">Page Error</div>
          <div id="not-found-title" className="not-found-title" aria-label="404">
            4<span>0</span>4
          </div>
          <h1 className="not-found-heading">এই পাতাটি আর এখানে নেই।</h1>
          <p className="not-found-copy">
            হয়তো পাতাটি সরিয়ে ফেলা হয়েছে, ঠিকানা বদলেছে, অথবা আপনি এমন একটি লিংকে এসেছেন যা আর সক্রিয় নেই। মূল পাতায় ফিরে গিয়ে নতুন করে খুঁজে দেখতে পারেন।
          </p>
          <div className="not-found-actions">
            <Link href="/" className="not-found-action primary">হোমে ফিরে যান ↗</Link>
            <Link href="/search/" className="not-found-action">সার্চ করুন</Link>
          </div>
        </div>

        <div className="not-found-art" aria-hidden="true">
          <div className="not-found-card">
            <div className="not-found-card-number">4<span>0</span>4</div>
          </div>
        </div>
      </section>

      <footer className="not-found-footer">
        <span>পৃষ্ঠা পাওয়া যায়নি</span>
        <span>সোহানুর রহমান | Notes</span>
      </footer>
    </main>
  )
}
