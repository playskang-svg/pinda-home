// Fills the stored pages (worker.ts) after a deploy or /admin edit, retrying renders the free plan cuts off (503).
// Run: node scripts/warm.mjs [base-url]
const base = process.argv[2] ?? 'https://pinda.kr'
const ROUNDS = 40

const xml = await fetch(`${base}/sitemap.xml`).then((res) => {
  if (!res.ok) throw new Error(`sitemap ${res.status}`)
  return res.text()
})
let pending = ['/sitemap.xml', '/rss.xml', ...[...xml.matchAll(/<loc>https:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/')]
console.log('pages', pending.length)

for (let round = 1; round <= ROUNDS && pending.length; round += 1) {
  const failed = []
  for (const path of pending) {
    try {
      const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30_000) })
      await res.arrayBuffer()
      if (res.status !== 200) failed.push(path)
    } catch {
      failed.push(path)
    }
  }
  console.log(`round ${round}: ${pending.length - failed.length} ok, ${failed.length} left`)
  pending = failed
}
if (pending.length) {
  console.log('still failing', pending)
  process.exit(1)
}
