import type { Metadata } from 'next'
import Link from '@/components/Link'

import { JsonLd } from '@/components/JsonLd'
import { PhotoHead } from '@/components/PhotoHead'
import { PostList } from '@/components/PostList'
import { ToolCards } from '@/components/ToolCards'
import { getClient, publishedWhere, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/payload'
import { pageMeta, publisher } from '@/lib/seo'
import { CATEGORIES } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  ...pageMeta({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' }),
  title: { absolute: SITE_TITLE },
}

export default async function HomePage() {
  const payload = await getClient()
  const posts = await payload.find({
    collection: 'posts',
    where: publishedWhere(),
    limit: 7,
    depth: 1,
    sort: '-publishedAt',
  })

  return (
    <>
      <JsonLd
        data={{
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: 'ko-KR',
          description: SITE_DESCRIPTION,
          publisher,
        }}
      />
      <PhotoHead
        lede="공식 요금표로 직접 계산해 보고, 고지서의 숫자가 어떻게 나왔는지 항목별로 확인하세요."
        photo="/photos/hero.webp"
        photoAlt="거실에서 고지서와 휴대폰을 함께 보는 한국인 여성"
        tall
        title="이번 달 전기·가스·수도 요금, 왜 이만큼 나왔을까요?"
      >
        <div className="hero-actions">
          <a className="button" href="#tools">
            내 요금 계산하기
          </a>
          <Link className="button button--ghost" href="/rates">
            요금표 모음 보기
          </Link>
        </div>
      </PhotoHead>

      <section className="section" id="tools">
        <div className="frame">
          <h2>요금 계산기</h2>
          <p className="section-lede">
            고지서의 사용량만 넣으면 됩니다. 입력한 값은 이 기기 안에서만 계산하며 어디에도 저장하지 않습니다.
          </p>
          <ToolCards />
        </div>
      </section>

      <section className="section section--tone">
        <div className="frame">
          <h2>최근에 정리한 글</h2>
          <PostList feature posts={posts.docs} />
          <Link className="text-link" href="/posts">
            전체 글 보기
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="frame">
          <h2>주제별로 찾아보기</h2>
          <ul className="topic-grid">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link href={`/${category.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" height={360} loading="lazy" src={category.photo} width={640} />
                  <strong>{category.title}</strong>
                  <span>{category.lede}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--photo band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="section__photo" height={700} loading="lazy" src="/photos/support.webp" width={1200} />
        <div className="frame section__body">
          <h2>숫자는 공식 자료에서만 가져옵니다</h2>
          <p>요금표마다 출처와 확인 날짜를 적고, 요금이 바뀌면 계산기와 글을 함께 고칩니다.</p>
          <Link className="button" href="/editorial-policy">
            자료 확인 기준 보기
          </Link>
        </div>
      </section>
    </>
  )
}
