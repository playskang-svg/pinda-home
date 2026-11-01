# 살림핀다 (pinda.kr)

Payload CMS + Next.js on Cloudflare Workers (D1, R2).

## Deploy

OpenNext does not produce a working Worker on Windows, so GitHub Actions bundles on Linux.

1. `git push` to `main` and wait for the Build workflow.
2. `pnpm deploy:ci` downloads the bundle and uploads it with the local wrangler login.

After changing a collection, also run these before deploying:

```bash
pnpm payload migrate:create <name>
NODE_ENV=production pnpm payload migrate
```

## Content

- Posts, prices and deals are edited at `/admin`. Publishing needs no deploy.
- `scripts/seed.ts` loads the starter data and can be re-run. It overwrites records with the same slug.
- `pnpm exec tsx scripts/og.mjs` renders share thumbnails with the snsogg skill into `og/`.

## Environment

- `PAYLOAD_SECRET`: Worker secret, plus `.env` for local CLI runs.
- `NEXT_PUBLIC_GA_ID`: optional, read at build time.
