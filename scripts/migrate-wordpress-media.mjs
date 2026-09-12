import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import https from 'node:https'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { URL } from 'node:url'

const execFileAsync = promisify(execFile)
const base = (process.env.WP_URL || 'https://blog.suhanurrahman.com').replace(/\/$/, '')
const host = new URL(base).hostname
const legacyIp = process.env.LEGACY_WP_IP
const bucket = process.env.MEDIA_BUCKET || 'suhanur-blog-media'
const perPage = 100
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'wp-media-'))

if (!legacyIp) throw new Error('LEGACY_WP_IP is required')

function lookupLegacy(_hostname, options, callback) {
  if (options?.all) return callback(null, [{ address: legacyIp, family: 4 }])
  return callback(null, legacyIp, 4)
}

function requestBuffer(pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: host,
      port: 443,
      path: pathname,
      method: 'GET',
      servername: host,
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
    const query = new URLSearchParams({ per_page: String(perPage), page: String(page), media_type: 'image' })
    const result = await fetchJson(`/wp-json/wp/v2/media?${query}`)
    rows.push(...result.data)
    const totalPages = Number(result.headers['x-wp-totalpages'] || 1)
    if (page >= totalPages) break
    page += 1
  }
  return rows
}

function objectKeyFromUrl(sourceUrl) {
  const url = new URL(sourceUrl)
  const marker = '/wp-content/uploads/'
  const index = url.pathname.indexOf(marker)
  if (index < 0) return null
  return `media/uploads/${decodeURIComponent(url.pathname.slice(index + marker.length))}`
}

async function uploadOne(item) {
  const source = item.source_url
  const key = objectKeyFromUrl(source)
  if (!key) return { skipped: true, reason: 'not an uploads URL', source }

  const sourceUrl = new URL(source)
  const sourcePath = sourceUrl.pathname + sourceUrl.search
  const response = await requestBuffer(sourcePath)
  if (response.status !== 200) return { skipped: true, reason: `HTTP ${response.status}`, source }

  const ext = path.extname(sourceUrl.pathname) || '.bin'
  const tempFile = path.join(tempDir, `${crypto.createHash('sha1').update(source).digest('hex')}${ext}`)
  await fs.writeFile(tempFile, response.body)

  const contentType = item.mime_type || 'application/octet-stream'
  await execFileAsync('npx', [
    'wrangler', 'r2', 'object', 'put', `${bucket}/${key}`,
    '--file', tempFile,
    '--content-type', contentType,
    '--remote',
  ], { env: process.env, maxBuffer: 10 * 1024 * 1024 })

  await fs.rm(tempFile, { force: true })
  return { uploaded: true, source, key, bytes: response.body.length }
}

const media = await fetchAllMedia()
console.log(`Found ${media.length} WordPress media items.`)
let uploaded = 0
let skipped = 0

for (const item of media) {
  try {
    const result = await uploadOne(item)
    if (result.uploaded) {
      uploaded += 1
      console.log(`Uploaded ${uploaded}/${media.length}: ${result.key} (${result.bytes} bytes)`)
    } else {
      skipped += 1
      console.warn(`Skipped: ${result.source} — ${result.reason}`)
    }
  } catch (error) {
    skipped += 1
    console.error(`Failed: ${item.source_url}`)
    console.error(error instanceof Error ? error.message : error)
  }
}

await fs.rm(tempDir, { recursive: true, force: true })
console.log(`Media migration complete: ${uploaded} uploaded, ${skipped} skipped.`)
