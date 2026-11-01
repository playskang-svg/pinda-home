import { cache } from 'react'

import { getClient } from './payload'

export const getTariff = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({ collection: 'tariffs', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  return docs[0] ?? null
})
