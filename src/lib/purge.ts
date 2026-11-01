import { getCloudflareContext } from '@opennextjs/cloudflare'

// Drops every stored page (see worker.ts) after an edit in /admin. Edge copies expire within EDGE_TTL.
export const purgeStoredPages = async (): Promise<void> => {
  let bucket: R2Bucket
  try {
    bucket = (await getCloudflareContext({ async: true })).env.R2
  } catch {
    return // CLI runs (seed, migrate) have no request context; deploying starts a new prefix anyway.
  }
  let cursor: string | undefined
  do {
    const listed = await bucket.list({ prefix: 'html/', cursor })
    if (listed.objects.length) await bucket.delete(listed.objects.map((object) => object.key))
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
}
