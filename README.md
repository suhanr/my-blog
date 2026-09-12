# Suhanur Rahman Blog CMS

A self-hosted-style editorial CMS built with Next.js, vinext and Cloudflare Workers. Production data lives in Cloudflare D1; media files live in R2.

## Runtime

- Next.js 16 / React 19
- vinext + Cloudflare Workers
- D1 for posts, categories, tags and comments
- R2 for image media

## Cloudflare setup

1. Create a D1 database named `suhanur-blog`.
2. Create an R2 bucket named `suhanur-blog-media`.
3. Put the D1 database ID into `wrangler.toml`.
4. Configure these secrets in the Worker: `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
5. Apply the migration with `wrangler d1 migrations apply suhanur-blog --remote`.
6. Connect `blog.suhanurrahman.com` as the custom Worker domain.

## Local

Copy `.dev.vars.example` to `.dev.vars` and set the two secrets. Use the vinext dev workflow for the Cloudflare runtime.

## CMS

`/admin/` is the private publishing portal. It supports posts, drafts, publishing, categories, tags, media upload and comment moderation.

Post content is authored in Markdown. Published articles are rendered as semantic HTML with `BlogPosting` metadata, canonical URLs and dynamic sitemap entries.

## WordPress migration

Use `scripts/export-wordpress.mjs` to pull posts, categories and tags from an existing WordPress REST API and produce a migration bundle. The generated post data can then be loaded into D1 with the migration tooling.
