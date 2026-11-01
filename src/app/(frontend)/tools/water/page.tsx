import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { WaterCalculator } from '@/components/calculators'
import Link from '@/components/Link'
import { ToolPage } from '@/components/ToolPage'
import type { WaterData } from '@/lib/calc'
import { pageMeta } from '@/lib/seo'
import { getTariff } from '@/lib/tariffs'

export const dynamic = 'force-dynamic'

const path = '/tools/water'
const title = '수도요금 계산기 (서울 가정용)'
const lede = '서울아리수본부 계산법 그대로 상수도, 하수도, 물이용부담금을 나눠 계산합니다. 공동주택 세대 수도 넣을 수 있습니다.'

export const metadata: Metadata = pageMeta({ title, description: lede, path, image: '/photos/shower.webp' })

export default async function Page() {
  const tariff = await getTariff('water-seoul')
  if (!tariff) notFound()
  const data = tariff.data as WaterData
  return (
    <ToolPage
      calculator={<WaterCalculator data={data} />}
      categorySlug="water"
      lede={lede}
      path={path}
      photo="/photos/shower.webp"
      photoAlt="욕실 샤워기 온수 조절 손잡이를 돌리는 손"
      tariff={tariff}
      title={title}
    >
      <h2>계산 순서</h2>
      <ol>
        <li>세대당 월평균 사용량 = 사용량 ÷ 고지 개월 수 ÷ 세대 수. 소수점 첫째 자리까지만 남깁니다.</li>
        <li>상수도 사용요금 = 세대당 월평균 사용량 × {data.waterRate}원 × 세대 수 × 개월 수</li>
        <li>기본요금은 계량기 구경별 정액에 개월 수를 곱합니다.</li>
        <li>하수도요금과 물이용부담금도 같은 방식으로 ㎥당 요율을 곱합니다.</li>
        <li>각 항목의 일의 자리는 버립니다.</li>
      </ol>
      <h2>서울 하수도 요율은 해마다 오릅니다</h2>
      <div className="table-wrap">
        <table className="rate-table">
          <thead>
            <tr>
              <th scope="col">적용 시기</th>
              <th scope="col" className="num">㎥당 요율</th>
            </tr>
          </thead>
          <tbody>
            {data.sewerSchedule.map((row) => (
              <tr key={row.from}>
                <th scope="row">{row.from} 1월 사용분부터</th>
                <td className="num">{row.rate}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>다른 지역에 살고 있다면</h2>
      <p>
        요금 체계가 도시마다 달라서 이 계산기는 서울 기준입니다. 부산과 인천은 하수도요금이 사용량에 따라 누진됩니다. 주요 도시의
        단가는 <Link href="/rates">공식 요금표</Link>에서 비교할 수 있습니다.
      </p>
      <p>
        감면 제도와 누수 확인법은 <Link href="/posts/seoul-water-bill-explained">서울 수도요금 읽는 법</Link>과{' '}
        <Link href="/posts/water-leak-check-reduction">누수 확인과 감면 신청</Link>에 정리했습니다.
      </p>
    </ToolPage>
  )
}
