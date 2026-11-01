import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ApplianceCalculator } from '@/components/calculators'
import Link from '@/components/Link'
import { ToolPage } from '@/components/ToolPage'
import { calcElectric, type ElectricData, won } from '@/lib/calc'
import { pageMeta } from '@/lib/seo'
import { getTariff } from '@/lib/tariffs'

export const dynamic = 'force-dynamic'

const path = '/tools/appliance'
const title = '가전 전기요금 계산기'
const lede = '같은 가전도 평소 사용량에 따라 요금이 달라집니다. 누진 구간까지 반영해 늘어나는 금액을 계산합니다.'

export const metadata: Metadata = pageMeta({ title, description: lede, path, image: '/photos/appliance.webp' })

export default async function Page() {
  const tariff = await getTariff('electricity-residential')
  if (!tariff) notFound()
  const data = tariff.data as ElectricData
  const added = (base: number) =>
    calcElectric(data, { kwh: base + 270, voltage: 'low', season: 'summer' }).total -
    calcElectric(data, { kwh: base, voltage: 'low', season: 'summer' }).total
  return (
    <ToolPage
      calculator={<ApplianceCalculator data={data} />}
      categorySlug="savings"
      lede={lede}
      path={path}
      photo="/photos/appliance.webp"
      photoAlt="주방 멀티탭의 전원을 끄는 한국인 여성"
      tariff={tariff}
      title={title}
    >
      <h2>왜 평소 사용량을 묻나요</h2>
      <p>
        전기요금은 누진제라 같은 1kWh도 어느 구간에서 쓰느냐에 따라 값이 다릅니다. 한전 예시대로 1,800W 에어컨을 하루 5시간,
        30일 쓰면 270kWh가 늘어납니다. 여름철 저압 기준으로 늘어나는 요금은 평소 사용량에 따라 이렇게 달라집니다.
      </p>
      <div className="table-wrap">
        <table className="rate-table">
          <thead>
            <tr>
              <th scope="col">평소 사용량</th>
              <th scope="col" className="num">에어컨 270kWh 추가 시 늘어나는 요금</th>
            </tr>
          </thead>
          <tbody>
            {[100, 200, 300, 400].map((base) => (
              <tr key={base}>
                <th scope="row">{base}kWh</th>
                <td className="num">{won(added(base))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>소비전력은 어디서 보나요</h2>
      <p>
        제품 뒤나 옆의 정격 라벨, 또는 에너지소비효율등급 라벨에 적혀 있습니다. 목록의 값은 한전 전기요금 체험관의 예시이며
        실제 제품과 다를 수 있습니다. 에어컨처럼 출력이 변하는 제품은 정격 소비전력보다 실제 평균이 낮을 수 있어, 이 계산은 최대치에
        가까운 값으로 보는 편이 좋습니다.
      </p>
      <p>
        계산식은 소비전력(W) × 하루 사용 시간 × 사용 일수 ÷ 1,000입니다. 표로 비교하고 싶다면{' '}
        <Link href="/posts/appliance-monthly-electricity-table">가전별 한 달 전기요금 표</Link>를 참고하세요.
      </p>
    </ToolPage>
  )
}
