# 살림핀다 (pinda.kr)

전기·도시가스·수도 요금 계산기와 안내 글. Payload CMS + Next.js on Cloudflare Workers (D1, R2).

## Deploy

OpenNext does not produce a working Worker on Windows, so GitHub Actions bundles on Linux.

1. `git push` to `main` and wait for the Build workflow.
2. `pnpm deploy:ci` from Git Bash (Windows' own `tar` rejects `--force-local`). It downloads the bundle and uploads it with the local wrangler login.
3. `node scripts/warm.mjs` to fill the stored pages for the new version.

After changing a collection, also run these before deploying:

```bash
pnpm payload migrate:create <name>
NODE_ENV=production pnpm payload migrate
```

## Stored pages

`worker.ts` sits in front of OpenNext. A finished page is kept in R2 under `html/<version id>/`, so readers and crawlers skip the Payload render, which the free plan can stop with Error 1102 (503).

- A new deploy starts an empty prefix. Run `scripts/warm.mjs`, which retries 503s.
- A save in `/admin` empties the stored pages. Run `scripts/warm.mjs` afterward. Returning browsers can keep a page for up to 4 hours because of the zone's Browser Cache TTL.
- A seed run does not purge. Deploy again, or save anything in `/admin`, then warm.

## Old saju routes

Saju moved to `saju.pinda.kr` (`C:\Window_DEV\PindaAI`). `worker.ts` redirects its old paths, including the installed app's `/?source=app`, serves a service worker that unregisters itself, and forwards PayApp notices. Keep `public/ads.txt`: subdomains read it from the root domain.

## Content

- Posts are `content/posts/*.json`, checked by `node scripts/check-posts.mjs`.
- Rates are `scripts/tariffs.ts`; the calculators read them from D1, and `src/lib/calc.test.ts` holds the official examples. `/admin` edits are overwritten by the next seed run.
- `NODE_ENV=production pnpm payload run scripts/seed.ts` loads everything and matches records by slug. Remote D1 sometimes drops the connection late in the run; re-run it.
- `pnpm exec tsx scripts/og.mjs` renders share thumbnails with the snsogg skill into `og/`.

## Dates to recheck

- 2026-12-01: city gas social discount notice expires 11-30.
- 2026-12: Gwangju water 700원, sewer 510원. Q1 2027 fuel adjustment notice. City gas cashback winter notice.
- 2027-01: Seoul sewer 560원, city gas raw material change.

## Environment

- `PAYLOAD_SECRET`: Worker secret, plus `.env` for local CLI runs.
- Admin login: `.secrets/admin.txt` (not in git).
