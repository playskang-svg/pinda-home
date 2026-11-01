// Checks content/posts/*.json against the writing rules. Usage: node scripts/check-posts.mjs [slug ...]
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'content/posts')
const only = process.argv.slice(2)
const files = readdirSync(dir).filter((name) => name.endsWith('.json'))
const posts = files.map((name) => JSON.parse(readFileSync(path.join(dir, name), 'utf8')))
const slugs = new Set(posts.map((post) => post.slug))
const CATEGORIES = ['electricity', 'gas-heating', 'water', 'support', 'savings']
const BANNED = ['살펴보겠습니다', '알아보겠습니다', '결론적으로', '종합적으로', '다양한', '중요합니다', '많은 분들', '오늘은', '이번 글에서는', '꿀팁', '완벽 정리', '총정리', '**', '애드센스']

const textOf = (part) => (typeof part === 'string' ? part : part.text)
const paragraph = (block) => (typeof block.p === 'string' ? block.p : block.p.map(textOf).join(''))
const sentences = (text) => (text.match(/[.!?](?=\s|$)/g) ?? []).length

let failed = 0
for (const post of posts) {
  if (only.length && !only.includes(post.slug)) continue
  const errors = []
  const add = (message) => errors.push(message)
  if (!CATEGORIES.includes(post.category)) add(`category ${post.category}`)
  if (post.title.length > 40) add(`title ${post.title.length}자`)
  if (post.hook.length > 22) add(`hook ${post.hook.length}자`)
  if (post.summary.length < 60 || post.summary.length > 170) add(`summary ${post.summary.length}자`)
  if (!existsSync(path.join(root, 'public/photos', `${post.hero}.webp`))) add(`hero ${post.hero}`)
  if (post.related.length !== 3) add(`related ${post.related.length}개`)
  for (const slug of post.related) if (!slugs.has(slug) && !only.length) add(`related ${slug} 없음`)
  if (!post.sources?.length) add('sources 없음')

  let chars = 0
  let h2 = 0
  let links = 0
  let images = 0
  let tables = 0
  const all = []
  for (const block of post.body) {
    if ('h2' in block) {
      h2 += 1
      all.push(block.h2)
    } else if ('h3' in block) {
      all.push(block.h3)
    } else if ('p' in block) {
      const text = paragraph(block)
      chars += text.length
      all.push(text)
      if (sentences(text) > 3) add(`4문장 이상: ${text.slice(0, 30)}`)
      if (Array.isArray(block.p)) links += block.p.filter((part) => typeof part !== 'string').length
      for (const part of Array.isArray(block.p) ? block.p : []) {
        if (typeof part !== 'string' && !/^\/(tools|rates|posts)/.test(part.url)) add(`링크 ${part.url}`)
        if (typeof part !== 'string' && part.url.startsWith('/posts/') && !slugs.has(part.url.slice(7)) && !only.length) add(`링크 대상 없음 ${part.url}`)
      }
    } else if ('ul' in block || 'ol' in block) {
      const items = block.ul ?? block.ol
      for (const item of items) chars += item.length
      all.push(...items)
    } else if ('img' in block) {
      images += 1
      if (block.img === post.hero) add('본문 사진이 hero와 같음')
      if (!existsSync(path.join(root, 'public/photos', `${block.img}.webp`))) add(`사진 ${block.img}`)
      if (!block.caption.startsWith('▲')) add('캡션 ▲ 없음')
    } else if ('table' in block) {
      tables += 1
      const width = block.table.head.length
      for (const row of block.table.rows) if (row.length !== width) add(`표 열 수: ${row.join('|').slice(0, 30)}`)
    } else {
      add(`알 수 없는 블록 ${JSON.stringify(block).slice(0, 40)}`)
    }
  }
  if (chars < 1800) add(`본문 ${chars}자`)
  if (h2 < 4 || h2 > 7) add(`h2 ${h2}개`)
  if (links < 2) add(`내부 링크 ${links}개`)
  if (images !== 1) add(`사진 ${images}장`)
  if (tables < 1) add('표 없음')
  const joined = all.join('\n')
  for (const word of BANNED) if (joined.includes(word)) add(`금지 표현 ${word}`)
  if (/https?:\/\/|www\./.test(joined)) add('URL 노출')
  if (errors.length) {
    failed += 1
    console.log(`✗ ${post.slug}\n  ${errors.join('\n  ')}`)
  } else {
    console.log(`✓ ${post.slug} (${chars}자)`)
  }
}
process.exit(failed ? 1 : 0)
