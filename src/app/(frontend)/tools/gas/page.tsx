import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { GasCalculator } from '@/components/calculators'
import Link from '@/components/Link'
import { ToolPage } from '@/components/ToolPage'
import type { GasData } from '@/lib/calc'
import { pageMeta } from '@/lib/seo'
import { getTariff } from '@/lib/tariffs'

export const dynamic = 'force-dynamic'

const path = '/tools/gas'
const title = '도시가스 요금 계산기'
const lede = '지역과 고지서의 사용 열량을 넣으면 공급사 단가로 요금을 계산합니다. 사용량(㎥)으로도 추정할 수 있습니다.'

export const metadata: Metadata = pageMeta({ title, description: lede, path, image: '/photos/boiler.webp' })

export default async function Page() {
  const tariff = await getTariff('city-gas')
  if (!tariff) notFound()
  const data = tariff.data as GasData
  return (
    <ToolPage
      calculator={<GasCalculator data={data} />}
      categorySlug="gas-heating"
      lede={lede}
      path={path}
      photo="/photos/boiler.webp"
      photoAlt="베란다의 가스보일러를 점검하는 한국인 남성"
      tariff={tariff}
      title={title}
    >
      <h2>계산 방법</h2>
      <p>공급사가 안내하는 식은 다음과 같습니다.</p>
      <ol>
        <li>사용 열량(MJ) = 검침량(㎥) × 온압보정계수 × 평균열량(MJ/N㎥)</li>
        <li>요금 = (사용 열량 × 용도별 단가 + 기본요금) × 1.1 (부가세 10%)</li>
      </ol>
      <p>
        취사와 난방 단가가 다른 지역은 사용 열량 {data.cookLimitMj}MJ까지 취사 단가, 초과분에 난방 단가를 적용합니다. 이 기준은
        지역에 따라 다소 다를 수 있습니다.
      </p>
      <h2>㎥로 넣으면 왜 추정치인가요</h2>
      <p>
        온압보정계수와 평균열량은 공급사와 시기마다 다릅니다. 공식 열량 범위는 {data.minMjPerM3}~{data.maxMjPerM3}MJ/N㎥이고, 기본값{' '}
        {data.defaultMjPerM3}MJ는 이 범위 안에서 잡은 참고값입니다. 고지서에 사용 열량(MJ)이 적혀 있다면 열량으로 입력하는 편이
        정확합니다.
      </p>
      <h2>주의할 점</h2>
      <ul>
        <li>같은 지역이라도 공급사와 권역에 따라 단가가 다릅니다. 고지서의 공급사 요금표를 확인해 주세요.</li>
        <li>요금이 바뀐 달에는 사용일수로 나눠 계산하므로 고지서와 차이가 납니다.</li>
        <li>끝자리 처리 방식은 공급사마다 달라 결과를 약 금액으로 표시합니다.</li>
        <li>사회적 배려 대상자 경감과 에너지바우처는 넣지 않았습니다.</li>
        <li>개별난방 단가로 계산합니다. 중앙난방 단가가 따로 있는 지역은 고지서와 다를 수 있습니다.</li>
      </ul>
      <p>
        지역별 단가 차이는 <Link href="/rates">요금표 모음</Link>에서, 고지서 항목 설명은{' '}
        <Link href="/posts/city-gas-bill-explained">도시가스 고지서 읽는 법</Link>에서 확인할 수 있습니다.
      </p>
    </ToolPage>
  )
}
