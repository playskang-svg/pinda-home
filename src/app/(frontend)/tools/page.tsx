import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import Link from '@/components/Link'
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
      <section className="section section--tone">
        <div className="frame frame--text">
          <h2>계산 전에 고지서에서 찾을 값</h2>
          <ul>
            <li>전기요금: 한 달 사용량(kWh)과 계약 종류(저압 또는 고압)</li>
            <li>도시가스: 사용 열량(MJ)이 가장 정확하고, 없으면 사용량(㎥)과 지역으로 추정합니다.</li>
            <li>수도요금: 사용량(㎥), 고지 기간, 계량기 구경, 계량기를 함께 쓰는 세대 수</li>
            <li>가전 요금: 제품 라벨의 소비전력(W)과 평소 사용 시간</li>
          </ul>
          <h2>결과를 읽을 때 알아 둘 점</h2>
          <p>
            계산기는 공식 요금표와 각 기관이 안내한 계산 순서를 그대로 따릅니다. 전기와 서울 수도는 공식 예시와 같은 금액이 나오는지
            자동 시험으로 검사합니다. 다만 결과는 추정치이며 할인과 감면, 아파트 공동 설비 요금, 미납 금액은 들어 있지 않습니다.
          </p>
          <p>
            고지서와 금액이 다르다면 검침 기간이 요금 변경 시점이나 계절에 걸쳤는지부터 확인해 보세요. 항목별 설명은{' '}
            <Link href="/posts/electricity-bill-explained">전기요금 고지서 읽는 법</Link>과{' '}
            <Link href="/posts/city-gas-bill-explained">도시가스 고지서 읽는 법</Link>에 있습니다.
          </p>
        </div>
      </section>
    </>
  )
}
