// Loads categories, rate tables, pages and posts. Safe to re-run: records are matched by slug.
// Run: NODE_ENV=production pnpm payload run scripts/seed.ts   (remote D1 and R2)
import fs from 'node:fs'
import path from 'node:path'

import { type CollectionSlug, getPayload } from 'payload'

import config from '../src/payload.config'
import { CATEGORIES } from '../src/lib/site'
import { type Block, navigation, pages, photos, type PostSeed, VERIFIED } from './seed-data'
import { tariffs } from './tariffs'

const payload = await getPayload({ config })
const PHOTO_DIR = path.resolve('public/photos')
const OG_DIR = path.resolve('og')
const POST_DIR = path.resolve('content/posts')

/* eslint-disable @typescript-eslint/no-explicit-any */
const upsert = async (collection: CollectionSlug, where: any, data: any): Promise<any> => {
  const { docs } = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
  if (docs[0]) return payload.update({ collection, id: docs[0].id, data, depth: 0 } as any)
  return payload.create({ collection, data, depth: 0 } as any)
}

const uploadOnce = async (file: string, alt: string): Promise<number> => {
  const filename = path.basename(file)
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) return docs[0].id
  const data = fs.readFileSync(file)
  const mimetype = filename.endsWith('.png') ? 'image/png' : 'image/webp'
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype, name: filename, size: data.length },
  })
  return doc.id
}

const textNode = (text: string) => ({
  type: 'text',
  version: 1,
  text,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
})
const element = (type: string, children: any[], extra: any = {}) => ({
  type,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children,
  ...extra,
})
const para = (children: any[]) => element('paragraph', children, { textFormat: 0, textStyle: '' })
const list = (items: string[], tag: 'ul' | 'ol') =>
  element(
    'list',
    items.map((item, index) => element('listitem', [textNode(item)], { value: index + 1 })),
    { listType: tag === 'ul' ? 'bullet' : 'number', tag, start: 1 },
  )
const cell = (text: string, headerState: number) =>
  element('tablecell', [para([textNode(text)])], { colSpan: 1, rowSpan: 1, headerState, backgroundColor: null })
const table = (head: string[], rows: string[][]) =>
  element('table', [
    element('tablerow', head.map((text) => cell(text, 1))),
    ...rows.map((row) => element('tablerow', row.map((text) => cell(text, 0)))),
  ])

const toLexical = (blocks: Block[], media: Record<string, number>) => ({
  root: element(
    'root',
    blocks.flatMap((block): any[] => {
      if ('h2' in block) return [element('heading', [textNode(block.h2)], { tag: 'h2' })]
      if ('h3' in block) return [element('heading', [textNode(block.h3)], { tag: 'h3' })]
      if ('ul' in block) return [list(block.ul, 'ul')]
      if ('ol' in block) return [list(block.ol, 'ol')]
      if ('table' in block) return [table(block.table.head, block.table.rows)]
      if ('img' in block) {
        if (!media[block.img]) throw new Error(`unknown photo: ${block.img}`)
        return [
          {
            type: 'upload',
            version: 3,
            format: '',
            relationTo: 'media',
            value: media[block.img],
            fields: null,
          },
          para([textNode(block.caption)]),
        ]
      }
      if (typeof block.p === 'string') return [para([textNode(block.p)])]
      return [
        para(
          block.p.map((part) =>
            typeof part === 'string'
              ? textNode(part)
              : element('link', [textNode(part.text)], {
                  fields: { linkType: 'custom', url: part.url, newTab: false },
                }),
          ),
        ),
      ]
    }),
  ),
})

const media: Record<string, number> = {}
for (const [name, alt] of Object.entries(photos)) {
  media[name] = await uploadOnce(path.join(PHOTO_DIR, `${name}.webp`), alt)
}
console.log('photos', Object.keys(media).length)

const categoryIds: Record<string, number> = {}
for (const { slug, title } of CATEGORIES) {
  categoryIds[slug] = (await upsert('categories', { slug: { equals: slug } }, { slug, title })).id
}

for (const tariff of tariffs) {
  await upsert('tariffs', { slug: { equals: tariff.slug } }, { ...tariff, verifiedAt: VERIFIED })
}
console.log('tariffs', tariffs.length)

for (const page of pages) {
  const { body, ...rest } = page
  await upsert('pages', { slug: { equals: page.slug } }, { ...rest, content: toLexical(body, media) })
}
console.log('pages', pages.length)

await payload.updateGlobal({ slug: 'navigation', data: navigation })

const posts: PostSeed[] = fs
  .readdirSync(POST_DIR)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(fs.readFileSync(path.join(POST_DIR, name), 'utf8')))
  .sort((a, b) => a.order - b.order)

const postIds: Record<string, number> = {}
for (const [index, post] of posts.entries()) {
  const ogFile = path.join(OG_DIR, `${post.slug}.png`)
  const ogImage = fs.existsSync(ogFile) ? await uploadOnce(ogFile, `${post.title} 공유 썸네일`) : undefined
  const saved = await upsert(
    'posts',
    { slug: { equals: post.slug } },
    {
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      category: categoryIds[post.category],
      heroImage: media[post.hero],
      ogImage,
      content: toLexical(post.body, media),
      sources: post.sources,
      verifiedAt: VERIFIED,
      // Spaced by a minute so the newest-first list keeps the planned order.
      publishedAt: new Date(Date.parse(VERIFIED) - index * 60_000).toISOString(),
      _status: 'published',
    },
  )
  postIds[post.slug] = saved.id
}
for (const post of posts) {
  await payload.update({
    collection: 'posts',
    id: postIds[post.slug],
    data: { relatedPosts: post.related.map((slug) => postIds[slug]).filter(Boolean), _status: 'published' },
    depth: 0,
  })
}
console.log('posts', posts.length)
process.exit(0)
