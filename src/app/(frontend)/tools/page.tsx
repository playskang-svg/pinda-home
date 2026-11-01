import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import { ToolCards } from '@/components/ToolCards'
import { pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const description = '전기, 가전, 도시가스, 수도 요금을 공식 요금표로 직접 계산하는 무료 계산기입니다. 항목별 금액까지 확인할 수 있습니다.'

export const metadata: Metadata = pageMeta({ title: '요금 계산기', description, path: '/tools' })

export default function ToolsPage() {
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: '요금 계산기', path: '/tools' }]} />}
        lede={description}
        photo="/photos/bill.webp"
        title="요금 계산기"
      />
      <section className="section">
        <div className="frame">
          <ToolCards />
        </div>
      </section>
    </>
  )
}
