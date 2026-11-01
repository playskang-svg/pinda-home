import React from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { PostList } from '@/components/PostList'
import { ToolCards } from '@/components/ToolCards'
import { getClient, publishedWhere, SITE_URL } from '@/lib/payload'
import { formatDate } from '@/lib/pricing'
import type { Tariff } from '@/payload-types'

// Shared frame: calculator up top, explanation and official sources below, then related reading.
export async function ToolPage({
  title,
  lede,
  path,
  photo,
  photoAlt,
  tariff,
  categorySlug,
  calculator,
  children,
}: {
  title: string
  lede: string
  path: string
  photo: string
  photoAlt: string
  tariff: Tariff
  categorySlug: string
  calculator: React.ReactNode
  children: React.ReactNode
}) {
  const payload = await getClient()
  const category = await payload.find({ collection: 'categories', where: { slug: { equals: categorySlug } }, limit: 1 })
  const posts = category.docs[0]
    ? await payload.find({
        collection: 'posts',
        where: { and: [...publishedWhere().and, { category: { equals: category.docs[0].id } }] },
        limit: 3,
        depth: 1,
        sort: '-publishedAt',
      })
    : null
  return (
    <>
      <JsonLd
        data={{
          '@type': 'WebApplication',
          name: title,
          url: `${SITE_URL}${path}`,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any',
          inLanguage: 'ko-KR',
          description: lede,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
        }}
      />
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: '요금 계산기', path: '/tools' }, { name: title, path }]} />}
        lede={lede}
        photo={photo}
        photoAlt={photoAlt}
        title={title}
      />
      <section className="section tool-section">
        <div className="frame frame--text tool-body">
          {calculator}
          <p className="tool-meta">
            입력한 값은 이 기기 안에서만 계산하며 저장하지 않습니다. 요금표 기준: {tariff.effectiveFrom}. 확인일:{' '}
            {formatDate(tariff.verifiedAt)}.
          </p>
          {children}
          <h2>공식 출처</h2>
          <ul className="tool-meta">
            {tariff.sources?.map((source) => (
              <li key={source.id ?? source.url}>
                <a href={source.url} rel="noopener" target="_blank">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      {posts?.docs.length ? (
        <section className="section section--tone">
          <div className="frame">
            <h2>함께 읽으면 좋은 글</h2>
            <PostList posts={posts.docs} />
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="frame">
          <h2>다른 계산기</h2>
          <ToolCards except={path} />
        </div>
      </section>
    </>
  )
}
