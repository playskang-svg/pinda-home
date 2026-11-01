import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ElectricCalculator } from '@/components/calculators'
import Link from '@/components/Link'
import { ToolPage } from '@/components/ToolPage'
import { calcElectric, type ElectricData, won } from '@/lib/calc'
import { pageMeta } from '@/lib/seo'
import { getTariff } from '@/lib/tariffs'

export const dynamic = 'force-dynamic'

const path = '/tools/electricity'
const title = '주택용 전기요금 계산기'
const lede = '한 달 사용량을 넣으면 누진 구간별 전력량요금과 부가세, 전력기금까지 항목별로 계산합니다.'
const USAGE = [100, 200, 201, 250, 300, 350, 400, 401, 450, 500, 600, 800]

export const metadata: Metadata = pageMeta({ title, description: lede, path, image: '/photos/meter.webp' })

export default async function Page() {
  const tariff = await getTariff('electricity-residential')
  if (!tariff) notFound()
  const data = tariff.data as ElectricData
  return (
    <ToolPage
      calculator={<ElectricCalculator data={data} />}
      categorySlug="electricity"
      lede={lede}
      path={path}
      photo="/photos/meter.webp"
      photoAlt="아파트 복도의 전력량계를 휴대폰으로 찍는 한국인 남성"
      tariff={tariff}
      title={title}
    >
      <h2>사용량별 청구요금 한눈에 보기</h2>
      <p>저압 기준입니다. 경계인 200kWh와 201kWh, 400kWh와 401kWh의 차이를 보면 누진 구조가 바로 보입니다.</p>
      <div className="table-wrap">
        <table className="rate-table">
          <thead>
            <tr>
              <th scope="col">한 달 사용량</th>
              <th scope="col" className="num">봄·가을·겨울</th>
              <th scope="col" className="num">여름 (7~8월)</th>
            </tr>
          </thead>
          <tbody>
            {USAGE.map((kwh) => (
              <tr key={kwh}>
                <th scope="row">{kwh}kWh</th>
                <td className="num">{won(calcElectric(data, { kwh, voltage: 'low', season: 'normal' }).total)}</td>
                <td className="num">{won(calcElectric(data, { kwh, voltage: 'low', season: 'summer' }).total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>계산 순서</h2>
      <ol>
        <li>구간에 맞는 기본요금을 정합니다. 사용량 전체가 속한 구간의 기본요금 하나만 붙습니다.</li>
        <li>전력량요금은 구간별로 나눠 계산해 더합니다. 원 미만은 버립니다.</li>
        <li>
          기후환경요금 kWh당 {data.climatePerKwh}원과 연료비조정요금 kWh당 {data.fuelPerKwh}원을 더해 전기요금계를 만듭니다.
        </li>
        <li>부가가치세 10%는 원 미만을 반올림하고, 전력산업기반기금 2.7%는 10원 미만을 버립니다.</li>
        <li>모두 더한 뒤 10원 미만을 버리면 청구요금입니다.</li>
      </ol>
      <h2>계산 결과가 고지서와 다른 이유</h2>
      <ul>
        <li>검침일이 월 중간이면 두 계절이나 두 분기에 걸친 사용량을 일수로 나눠 계산합니다.</li>
        <li>복지할인, 대가족 할인, 자동이체 할인, 에너지캐시백은 넣지 않았습니다.</li>
        <li>아파트는 공용 전기와 관리비 계산 방식에 따라 세대 고지액이 달라질 수 있습니다.</li>
        <li>TV 수신료는 별도입니다.</li>
      </ul>
      <p>
        내 계약이 저압인지 고압인지 모르겠다면 <Link href="/posts/electricity-low-vs-high-voltage">저압과 고압 구분법</Link>을
        먼저 확인해 보세요.
      </p>
    </ToolPage>
  )
}
