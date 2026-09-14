export const SITE = 'https://blog.suhanurrahman.com'
export const SITE_NAME = 'সোহানুর রহমান | Notes'
export const AUTHOR_NAME = 'সোহানুর রহমান'
export const AUTHOR_URL = 'https://suhanurrahman.com/'
export const PROFILE_IMAGE = 'https://i0.wp.com/suhanurrahman.com/wp-content/uploads/2024/01/img-1.png?fit=512%2C512&ssl=1'
export const OG_IMAGE = `${SITE}/suhan-notes.png`

export const GLOBAL_KEYWORDS = [
  'সোহানুর রহমান',
  'সোহানুর রহমান Notes',
  'Suhanur Rahman',
  'technology Bangladesh',
  'এআই',
  'কৃত্রিম বুদ্ধিমত্তা',
  'প্রযুক্তি',
  'গবেষণা',
  'ডেটা',
  'ডিজিটাল সংস্কৃতি',
  'সাইবার নিরাপত্তা',
  'ওয়েব',
  'প্রোগ্রামিং',
]

export const DEFAULT_DESCRIPTION = 'সোহানুর রহমানের নোটস—প্রযুক্তি, এআই, গবেষণা, ডেটা, ডিজিটাল সংস্কৃতি, সাইবার নিরাপত্তা ও ওয়েব নিয়ে বাংলা লেখা, বিশ্লেষণ ও অনুসন্ধান।'

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`
}

export function postDescription(title: string, excerpt?: string | null) {
  const source = (excerpt || '').trim()
  return source || `${title} — সোহানুর রহমানের Notes-এ প্রযুক্তি, গবেষণা, ডেটা ও ডিজিটাল সংস্কৃতি নিয়ে লেখা।`
}

export function postKeywords(title: string, categoryName?: string | null, stored?: string | null) {
  const values = (stored || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const derived = [title, categoryName || '', ...GLOBAL_KEYWORDS.slice(0, 6)].filter(Boolean)
  return Array.from(new Set([...values, ...derived])).slice(0, 12)
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}
