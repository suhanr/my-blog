import fs from 'node:fs/promises'
import https from 'node:https'
import { URL } from 'node:url'

const base = (process.env.WP_URL || 'https://blog.suhanurrahman.com').replace(/\/$/, '')
const host = new URL(base).hostname
const legacyIp = process.env.LEGACY_WP_IP
const legacyServerName = process.env.LEGACY_SERVER_NAME || 'premium120.web-hosting.com'
const importUrl = process.env.MEDIA_IMPORT_URL || `${base}/api/media-import`
const importToken = process.env.MEDIA_IMPORT_TOKEN
const perPage = 100
const concurrency = 8

if (!legacyIp) throw new Error('LEGACY_WP_IP is required')
if (!importToken) throw new Error('MEDIA_IMPORT_TOKEN is required')

function lookupLegacy(_hostname, options, callback) {
  if (options?.all) return callback(null, [{ address: legacyIp, family: 4 }])
  return callback(null, legacyIp, 4)
}

function requestBuffer(pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: legacyServerName,
      port: 443,
      path: pathname,
      method: 'GET',
      servername: legacyServerName,
      headers: { Host: host, ...headers },
      lookup: lookupLegacy,
    }, (response) => {
      const chunks = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => resolve({ status: response.statusCode || 0, headers: response.headers, body: Buffer.concat(chunks) }))
    })
    request.on('error', reject)
    request.end()
  })
}

async function fetchJson(pathname) {
  const response = await requestBuffer(pathname, { Accept: 'application/json' })
  if (response.status !== 200) throw new Error(`WordPress API ${response.status}: ${pathname}`)
  return { data: JSON.parse(response.body.toString('utf8')), headers: response.headers }
}

async function fetchAllMedia() {
  const rows = []
  let page = 1
  while (true) {
    const query = new URLSearchParams({ per_page: String(perPage), page: String(page) })
    const result = await fetchJson(`/wp-json/wp/v2/media?${query}`)
    rows.push(...result.data)
    const totalPages = Number(result.headers['x-wp-totalpages'] || 1)
    if (page >= totalPages) break
    page += 1
  }
  return rows
}

function relativeUploadKey(sourceUrl) {
  const url = new URL(sourceUrl)
  const marker = '/wp-content/uploads/'
  const index = url.pathname.indexOf(marker)
  if (index < 0) return null
  return `uploads/${decodeURIComponent(url.pathname.slice(index + marker.length))}`
}

async function uploadOne(item) {
  const source = item.source_url
  const key = relativeUploadKey(source)
  if (!key) return { skipped: true, reason: 'not an uploads URL', source }

  const sourceUrl = new URL(source)
  const response = await requestBuffer(sourceUrl.pathname + sourceUrl.search)
  if (response.status !== 200) return { skipped: true, reason: `HTTP ${response.status}`, source }

  const target = new URL(importUrl)
  target.searchParams.set('key', key)
  const upload = await fetch(target, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${importToken}`,
      'Content-Type': item.mime_type || 'application/octet-stream',
    },
    body: response.body,
  })
  if (!upload.ok) throw new Error(`R2 upload ${upload.status}: ${key}`)
  return { uploaded: true, source, key, bytes: response.body.length }
}

const media = await fetchAllMedia()
console.log(`Found ${media.length} WordPress media items.`)
let cursor = 0
let uploaded = 0
let skipped = 0
const manifest = { uploaded: [], skipped: [] }

async function worker() {
  while (true) {
    const index = cursor++
    if (index >= media.length) return
    const item = media[index]
    try {
      const result = await uploadOne(item)
      if (result.uploaded) {
        uploaded += 1
        manifest.uploaded.push(result)
        console.log(`Uploaded ${uploaded}/${media.length}: ${result.key} (${result.bytes} bytes)`)
      } else {
        skipped += 1
        manifest.skipped.push(result)
        console.warn(`Skipped: ${result.source} — ${result.reason}`)
      }
    } catch (error) {
      skipped += 1
      const result = { source: item.source_url, reason: error instanceof Error ? error.message : String(error) }
      manifest.skipped.push(result)
      console.error(`Failed: ${item.source_url}`)
      console.error(result.reason)
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, media.length) }, () => worker()))
await fs.mkdir('migration-data', { recursive: true })
await fs.writeFile('migration-data/media-manifest.json', JSON.stringify(manifest, null, 2))
console.log(`Media migration complete: ${uploaded} uploaded, ${skipped} skipped.`)
