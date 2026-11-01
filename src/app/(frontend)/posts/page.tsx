import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import { PostList } from '@/components/PostList'
import { getClient, publishedWhere } from '@/lib/payload'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMeta({
  title: '전체 글',
  description: '전기·가스·수도 요금과 감면 제도, 절약 방법을 다룬 글 모음입니다.',
  path: '/posts',
})

export default async function PostsPage() {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: publishedWhere(),
    limit: 100,
    depth: 1,
    sort: '-publishedAt',
  })
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: '전체 글', path: '/posts' }]} />}
        lede="전기·가스·수도 요금과 감면 제도, 절약 방법을 다룬 글을 모았습니다."
        photo="/photos/bill.webp"
        title="전체 글"
      />
      <section className="section">
        <div className="frame">
          <PostList feature posts={docs} />
        </div>
      </section>
    </>
  )
}
