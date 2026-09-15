export const SITE = 'https://blog.suhanurrahman.com'
export const SITE_NAME = 'সোহানুর রহমান | Notes'
export const AUTHOR_NAME = 'সোহানুর রহমান'
export const AUTHOR_URL = 'https://suhanurrahman.com/'
export const PROFILE_IMAGE = 'https://i0.wp.com/suhanurrahman.com/wp-content/uploads/2024/01/img-1.png?fit=512%2C512&ssl=1'
export const OG_IMAGE = `${SITE}/suhan-notes.png`

/**
 * Brand/entity phrases only.
 * Broad topics such as AI, technology, research, data, programming, etc.
 * belong at article/topic level rather than being injected into every page.
 */
export const GLOBAL_KEYWORDS = [
  'সোহানুর রহমান',
  'Suhanur Rahman',
  'সোহানুর রহমান Notes',
  'Suhanur Rahman Notes',
  'সোহানুর রহমান ব্লগ',
  'Suhanur Rahman blog',
  "Suhan's Blog",
  'Suhans blog',
  'বাংলা প্রযুক্তি ব্লগ',
]

/**
 * Search-led topic clusters.
 * These are not treated as ranking guarantees or search-volume claims.
 * They are query-language variants observed in current Bangladesh/Bangla
 * search results and established content ecosystems, and are used as
 * article-level semantic signals when an article clearly matches a topic.
 */
type SeoCluster = {
  match: string[]
  keywords: string[]
}

export const SEO_TOPIC_CLUSTERS: SeoCluster[] = [
  {
    match: ['kobotoolbox', 'kobo toolbox', 'kobocollect', 'xlsform'],
    keywords: [
      'KoboToolbox বাংলা',
      'KoboToolbox tutorial বাংলা',
      'KoboToolbox training বাংলা',
      'KoboToolbox কী',
      'KoboToolbox data collection',
      'KoboToolbox XLSForm',
      'XLSForm tutorial বাংলা',
      'KoboCollect বাংলা',
      'KoboToolbox form তৈরি',
      'KoboToolbox survey',
      'KoboToolbox regex',
    ],
  },
  {
    match: ['stata', 'স্ট্যাটা', 'statistical analysis'],
    keywords: [
      'STATA বাংলা',
      'STATA tutorial বাংলা',
      'STATA Data Analysis বাংলা',
      'STATA দিয়ে data analysis',
      'গবেষণার জন্য STATA',
      'STATA data analysis',
      'STATA data cleaning',
      'STATA regression বাংলা',
      'STATA শেখার গাইড',
    ],
  },
  {
    match: ['research methodology', 'research method', 'গবেষণা পদ্ধতি', 'গবেষণা', 'survey research', 'questionnaire', 'sample size', 'research data', 'data collection'],
    keywords: [
      'গবেষণা পদ্ধতি',
      'গবেষণা পদ্ধতি বাংলা',
      'Research Methodology বাংলা',
      'Research Methodology কী',
      'গবেষণা প্রশ্ন',
      'research question বাংলা',
      'research design বাংলা',
      'sample size কী',
      'sample size calculation বাংলা',
      'survey research বাংলা',
      'questionnaire design বাংলা',
      'গবেষণা data analysis',
    ],
  },
  {
    match: ['data science', 'ডেটা সায়েন্স', 'ডেটা সায়েন্স', 'data analytics', 'data analyst', 'data scientist', 'machine learning'],
    keywords: [
      'Data Science বাংলা',
      'Data Science কী',
      'Data Science roadmap বাংলা',
      'Data Analytics বাংলা',
      'Data Science vs Data Analytics',
      'Machine Learning vs Data Science',
      'Data Analyst বাংলা',
      'Data Scientist বাংলা',
      'Python vs R Data Science',
    ],
  },
  {
    match: ['full stack', 'web development', 'software development', 'software engineering', 'programming', 'programmer', 'cse', 'git', 'github', 'html', 'css', 'javascript', 'react', 'node.js', 'nodejs', 'next.js', 'nextjs'],
    keywords: [
      'Programming বাংলা',
      'Web Development বাংলা',
      'Full Stack Developer বাংলা',
      'Full Stack Developer Roadmap বাংলা',
      'Web Development Roadmap বাংলা',
      'Software Developer বাংলা',
      'Software Engineering বাংলা',
      'CSE career বাংলা',
      'Git বাংলা tutorial',
      'Git কী',
      'GitHub বাংলা',
    ],
  },
  {
    match: ['cybersecurity', 'সাইবার', 'phishing', 'ফিশিং', 'ransomware', 'malware', 'virus', 'scam', 'স্ক্যাম', 'security'],
    keywords: [
      'সাইবার নিরাপত্তা বাংলা',
      'cybersecurity বাংলা',
      'সাইবার সিকিউরিটি বাংলা',
      'phishing বাংলা',
      'ফিশিং থেকে বাঁচার উপায়',
      'online scam থেকে বাঁচার উপায়',
      'ransomware কী',
      'malware কী',
      'online safety বাংলা',
      'ডিজিটাল নিরাপত্তা',
    ],
  },
  {
    match: ['privacy', 'প্রাইভেসি', 'data privacy', 'ডেটা প্রাইভেসি', 'browser fingerprint', 'isp', 'vpn', 'personal data', 'ব্যক্তিগত তথ্য'],
    keywords: [
      'ডিজিটাল প্রাইভেসি বাংলা',
      'data privacy বাংলা',
      'online privacy বাংলা',
      'ব্যক্তিগত তথ্য নিরাপত্তা',
      'ইন্টারনেট প্রাইভেসি বাংলা',
      'ISP কী দেখতে পারে',
      'VPN কি নিরাপদ',
      'browser fingerprinting বাংলা',
      'personal data privacy',
    ],
  },
  {
    match: ['artificial intelligence', 'কৃত্রিম বুদ্ধিমত্তা', ' ai ', 'chatgpt', 'openai', 'hallucination', 'deepfake', 'misinformation', 'disinformation', 'ai agent', 'ai agents'],
    keywords: [
      'AI বাংলা',
      'কৃত্রিম বুদ্ধিমত্তা বাংলা',
      'AI কী',
      'ChatGPT বাংলা',
      'ChatGPT কেন ভুল তথ্য দেয়',
      'AI কেন ভুল তথ্য দেয়',
      'AI hallucination বাংলা',
      'AI privacy বাংলা',
      'AI misinformation',
      'বাংলাদেশে AI',
      'বাংলাদেশে AI ব্যবহার',
    ],
  },
  {
    match: ['career', 'ক্যারিয়ার', 'job search', 'job', 'cv', 'resume', 'freelancing', 'remote work', 'future of work', 'অনলাইনে টাকা', 'facebook marketing', 'facebook', 'marketing'],
    keywords: [
      'ক্যারিয়ার গাইড বাংলা',
      'CSE career বাংলা',
      'CV বাংলা',
      'Resume বাংলা',
      'Job Search বাংলা',
      'Data Analyst career বাংলা',
      'Software Developer career বাংলা',
      'freelancing বাংলা',
      'remote work বাংলা',
      'Future of Work বাংলা',
      'অনলাইনে টাকা আয়',
    ],
  },
  {
    match: ['technology', 'প্রযুক্তি', 'digital culture', 'ডিজিটাল সংস্কৃতি', 'internet', 'web', 'social media', 'সোশ্যাল মিডিয়া'],
    keywords: [
      'প্রযুক্তি বাংলা',
      'বাংলা প্রযুক্তি',
      'Bangladesh technology',
      'digital culture বাংলা',
      'ইন্টারনেট বাংলা',
      'সোশ্যাল মিডিয়া বাংলা',
      'ডিজিটাল প্রযুক্তি বাংলাদেশ',
    ],
  },
]

export const DEFAULT_DESCRIPTION = 'সোহানুর রহমানের Notes — প্রযুক্তি, এআই, গবেষণা, ডেটা, প্রোগ্রামিং, সাইবার নিরাপত্তা, ডিজিটাল সংস্কৃতি, ক্যারিয়ার ও বাংলাদেশ-কেন্দ্রিক প্রযুক্তি নিয়ে বাংলা ও ইংরেজি লেখা, বিশ্লেষণ ও গাইড।'

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`
}

export function postDescription(title: string, excerpt?: string | null) {
  const source = (excerpt || '').trim()
  return source || `${title} — সোহানুর রহমানের Notes-এ প্রযুক্তি, গবেষণা, ডেটা ও ডিজিটাল সংস্কৃতি নিয়ে লেখা।`
}

function normalizeSearchText(value: string) {
  return ` ${value.toLowerCase().replace(/[\u200c\u200d]/g, ' ').replace(/[^\p{L}\p{N}.+#-]+/gu, ' ').replace(/\s+/g, ' ').trim()} `
}

function clusterMatches(cluster: SeoCluster, haystack: string) {
  return cluster.match.some((token) => haystack.includes(normalizeSearchText(token)))
}

export function postKeywords(title: string, categoryName?: string | null, stored?: string | null) {
  const values = (stored || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  const source = normalizeSearchText([title, categoryName || '', values.join(' ')].join(' '))
  const matched = SEO_TOPIC_CLUSTERS
    .filter((cluster) => clusterMatches(cluster, source))
    .flatMap((cluster) => cluster.keywords)

  // Keep article metadata compact. The title/category and existing manually
  // curated terms win; researched query variants are supporting signals.
  return Array.from(new Set([
    ...values,
    title,
    categoryName || '',
    ...matched,
  ].filter(Boolean))).slice(0, 16)
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
