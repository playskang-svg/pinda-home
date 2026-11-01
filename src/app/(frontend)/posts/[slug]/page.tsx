import type { Metadata } from 'next'
import Link from '@/components/Link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { RichText } from '@/components/RichText'
import { ShareBar } from '@/components/ShareBar'
import { absoluteUrl, getClient, publishedWhere, SITE_URL } from '@/lib/payload'
import { formatDate } from '@/lib/pricing'
import { pageMeta, publisher } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

const getPost = cache(async (slug: string) => {
  const payload = await getClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [...publishedWhere().and, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  const og = typeof post.ogImage === 'object' ? post.ogImage?.url : null
  const image = og ? absoluteUrl(og) : '/og-default.png'
  const category = typeof post.category === 'object' ? post.category : null
  return pageMeta({
    title: post.metaTitle || post.title,
    description: post.summary,
    path: `/posts/${post.slug}`,
    image,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: category?.title,
    },
  })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const hero = typeof post.heroImage === 'object' ? post.heroImage : null
  const category = typeof post.category === 'object' ? post.category : null
  const related = (post.relatedPosts ?? []).filter((p) => typeof p === 'object')
  const url = `${SITE_URL}/posts/${post.slug}`

  return (
    <article className="post">
      <JsonLd
        data={{
          '@type': 'Article',
          headline: post.title,
          description: post.summary,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          image: hero?.url ? absoluteUrl(hero.url) : undefined,
          mainEntityOfPage: url,
          articleSection: category?.title,
          inLanguage: 'ko-KR',
          author: publisher,
          publisher,
        }}
      />
      <PhotoHead
        eyebrow={
          <Breadcrumbs
            items={[
              ...(category ? [{ name: category.title, path: `/${category.slug}` }] : []),
              { name: post.title, path: `/posts/${post.slug}` },
            ]}
          />
        }
        lede={`${formatDate(post.verifiedAt)} 공식 자료 기준으로 확인`}
        photo={hero?.url}
        photoAlt={hero?.alt}
        title={post.title}
      />
      <div className="frame frame--text post__body">
        <aside className="summary">
          <strong>💡 핵심 한 줄 요약</strong>
          <p>{post.summary}</p>
        </aside>
        <RichText data={post.content} />
        {related.length ? (
          <section className="link-cards" aria-label="함께 보면 좋은 글">
            {related.map((item) => {
              if (typeof item !== 'object') return null
              const image = typeof item.heroImage === 'object' ? item.heroImage : null
              return (
                <Link className="link-card" href={`/posts/${item.slug}`} key={item.id}>
                  {image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" height={300} loading="lazy" src={image.url} width={480} />
                  ) : null}
                  <span>
                    <strong>{item.title}</strong>
                    {item.summary}
                  </span>
                </Link>
              )
            })}
          </section>
        ) : null}
        {post.sources?.length ? (
          <section className="sources">
            <h2>공식 출처</h2>
            <ul>
              {post.sources.map((source) => (
                <li key={source.id ?? source.url}>
                  <a href={source.url} rel="noopener" target="_blank">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <p className="disclosure">
          요금과 제도는 바뀔 수 있습니다. 실제 청구액과 신청 자격은 고지서와 해당 기관의 공식 안내를 기준으로 확인해
          주세요.
        </p>
        <ShareBar card text={post.summary} title={post.title} url={url} />
      </div>
    </article>
  )
}
