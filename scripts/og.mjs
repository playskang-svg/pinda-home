// Renders share thumbnails with the snsogg skill: one per post (og/<slug>.png) plus the site default.
// Run: pnpm exec tsx scripts/og.mjs
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const SKILL = 'C:/Window_DEV/.claude/skills/snsogg/render.mjs'
const { renderCard } = await import(pathToFileURL(SKILL).href)

const theme = {
  brand: '#ffffff',
  accent: '#ffcf9e',
  cta: '#b9541a',
}
const fontFiles = { 400: 'C:/Windows/Fonts/malgun.ttf', 700: 'C:/Windows/Fonts/malgunbd.ttf' }
const photo = (name) => `data:image/jpeg;base64,${readFileSync(`og/bg/${name}.jpg`).toString('base64')}`
const badges = {
  electricity: '전기요금',
  'gas-heating': '가스·난방',
  water: '수도요금',
  support: '지원·감면',
  savings: '절약 가이드',
}

const posts = readdirSync('content/posts')
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(`content/posts/${name}`, 'utf8')))

mkdirSync('og', { recursive: true })
for (const post of posts) {
  const png = await renderCard({
    layout: 'article',
    badge: badges[post.category],
    title: post.title,
    hook: post.hook,
    excerpt: post.summary,
    bgImage: photo(post.hero),
    footerText: 'pinda.kr',
    cta: '자세히 확인하기 →',
    theme,
    fontFiles,
  })
  writeFileSync(`og/${post.slug}.png`, png)
  console.log(post.slug, png.length)
}
const fallback = await renderCard({
  layout: 'article',
  badge: '생활요금 안내',
  title: '이번 달 전기·가스·수도 요금, 왜 이만큼 나왔을까요?',
  hook: '공식 요금표로 직접 계산해 보세요',
  excerpt: '고지서의 숫자가 어떻게 나왔는지 항목별로 확인하고, 신청해야 받는 감면과 효과 큰 절약 방법까지 정리했습니다.',
  bgImage: photo('hero'),
  footerText: 'pinda.kr',
  cta: '내 요금 계산하기 →',
  theme,
  fontFiles,
})
writeFileSync('public/og-default.png', fallback)
console.log('default', fallback.length)
