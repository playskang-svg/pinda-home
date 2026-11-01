import type { Metadata } from 'next'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PhotoHead } from '@/components/PhotoHead'
import type { ElectricData, GasData, Tier, WaterData } from '@/lib/calc'
import { formatDate } from '@/lib/pricing'
import { pageMeta } from '@/lib/seo'
import { getTariff } from '@/lib/tariffs'
import type { Tariff } from '@/payload-types'

export const dynamic = 'force-dynamic'

const description = '주택용 전기요금, 주요 지역 도시가스, 수도요금, 지역난방 요금표를 시행일과 공식 출처와 함께 모았습니다.'

export const metadata: Metadata = pageMeta({ title: '요금표 모음', description, path: '/rates' })

type WaterCities = {
  rows: { city: string; water: string; meter20: string; sewer: string; use: string; basis: string; sourceUrl: string }[]
}
type Heating = { basePerM2: number; single: number; spring: number; summer: number; winter: number; cooling: number }

const n = (value: number) => value.toLocaleString('ko-KR')
const range = (tiers: Tier[], index: number) => {
  const from = index === 0 ? 0 : tiers[index - 1].upTo
  const tier = tiers[index]
  return tier.upTo === null ? `${from}kWh 초과` : index === 0 ? `${tier.upTo}kWh 이하` : `${(from ?? 0) + 1}~${tier.upTo}kWh`
}

function Source({ tariff }: { tariff: Tariff }) {
  return (
    <p className="tool-meta">
      기준: {tariff.effectiveFrom}. 확인일: {formatDate(tariff.verifiedAt)}.{' '}
      {tariff.sources?.map((source, index) => (
        <span key={source.id ?? source.url}>
          {index ? ' · ' : '출처: '}
          <a href={source.url} rel="noopener" target="_blank">
            {source.label}
          </a>
        </span>
      ))}
    </p>
  )
}

function ElectricTable({ data, voltage, caption }: { data: ElectricData; voltage: 'low' | 'high'; caption: string }) {
  const plan = data[voltage]
  return (
    <div className="table-wrap">
      <table className="rate-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">기타 계절 구간</th>
            <th scope="col">여름(7~8월) 구간</th>
            <th scope="col" className="num">기본요금(원/호)</th>
            <th scope="col" className="num">전력량요금(원/kWh)</th>
          </tr>
        </thead>
        <tbody>
          {plan.normal.map((tier, index) => (
            <tr key={tier.rate}>
              <td>{range(plan.normal, index)}</td>
              <td>{range(plan.summer, index)}</td>
              <td className="num">{n(tier.base)}</td>
              <td className="num">{tier.rate.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function RatesPage() {
  const [electric, gas, water, cities, heating] = await Promise.all([
    getTariff('electricity-residential'),
    getTariff('city-gas'),
    getTariff('water-seoul'),
    getTariff('water-cities'),
    getTariff('district-heating'),
  ])
  const e = electric?.data as ElectricData | undefined
  const g = gas?.data as GasData | undefined
  const w = water?.data as WaterData | undefined
  const c = cities?.data as WaterCities | undefined
  const h = heating?.data as Heating | undefined
  return (
    <>
      <PhotoHead
        eyebrow={<Breadcrumbs items={[{ name: '요금표 모음', path: '/rates' }]} />}
        lede={description}
        photo="/photos/label.webp"
        title="요금표 모음"
      />
      <section className="section">
        <div className="frame frame--text rates">
          <p>
            살림핀다가 각 기관의 공식 자료에서 옮겨 정리한 표이며, 기관이 직접 제공하는 페이지가 아닙니다. 표마다 시행 기준과
            출처, 확인 날짜를 적었습니다. 실제 청구와 납부의 기준은 각 기관의 고지서입니다.
          </p>
          {electric && e ? (
            <div className="rates-block">
              <h2>주택용 전기요금</h2>
              <ElectricTable caption="저압 (아파트 포함 일반 가정 대부분)" data={e} voltage="low" />
              <ElectricTable caption="고압 (고압으로 공급받는 가정용)" data={e} voltage="high" />
              <ul>
                <li>기후환경요금 kWh당 {e.climatePerKwh.toFixed(1)}원, 연료비조정요금 kWh당 {e.fuelPerKwh.toFixed(1)}원 (2026년 10~12월분)</li>
                <li>부가가치세 10%, 전력산업기반기금 {(e.fundRate * 100).toFixed(1)}%</li>
                <li>
                  여름과 겨울(12~2월) 한 달 {n(e.superUserOver)}kWh 초과분은 kWh당 저압 {e.low.superUserRate}원, 고압 {e.high.superUserRate}원
                </li>
              </ul>
              <Source tariff={electric} />
            </div>
          ) : null}
          {gas && g ? (
            <div className="rates-block">
              <h2>도시가스 주택용 소매요금</h2>
              <div className="table-wrap">
                <table className="rate-table">
                  <caption>부가세 별도, 단가는 원/MJ</caption>
                  <thead>
                    <tr>
                      <th scope="col">지역</th>
                      <th scope="col">기본요금(원/월)</th>
                      <th scope="col" className="num">취사</th>
                      <th scope="col" className="num">개별난방</th>
                      <th scope="col">적용일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.regions.map((region) => (
                      <tr key={region.id}>
                        <th scope="row">
                          <a href={region.sourceUrl} rel="noopener" target="_blank">
                            {region.name}
                          </a>
                        </th>
                        <td>
                          {region.baseHeat === region.baseCook
                            ? n(region.baseHeat)
                            : `난방 ${n(region.baseHeat)} / 취사 ${n(region.baseCook)}`}
                        </td>
                        <td className="num">{region.rateCook.toFixed(4)}</td>
                        <td className="num">{region.rateHeat.toFixed(4)}</td>
                        <td>{region.effective}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>같은 지역도 공급사와 권역에 따라 단가가 다릅니다. 표는 대표 공급사 기준이므로 고지서의 공급사 요금표를 함께 확인해 주세요.</p>
              <Source tariff={gas} />
            </div>
          ) : null}
          {water && w ? (
            <div className="rates-block">
              <h2>서울 가정용 수도요금</h2>
              <ul>
                <li>상수도 ㎥당 {w.waterRate}원, 구간 없음</li>
                <li>하수도 ㎥당 {w.sewerRate}원 (2027년부터 {w.sewerSchedule[1].rate}원)</li>
                <li>물이용부담금 ㎥당 {w.useCharge}원</li>
              </ul>
              <div className="table-wrap">
                <table className="rate-table">
                  <caption>계량기 구경별 기본요금 (월)</caption>
                  <thead>
                    <tr>
                      {w.meterCharge.map((row) => (
                        <th className="num" key={row.mm} scope="col">
                          {row.mm}mm
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {w.meterCharge.map((row) => (
                        <td className="num" key={row.mm}>
                          {n(row.charge)}원
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <Source tariff={water} />
            </div>
          ) : null}
          {cities && c ? (
            <div className="rates-block">
              <h2>주요 도시 가정용 수도요금</h2>
              <div className="table-wrap">
                <table className="rate-table">
                  <caption>원/㎥. 기본요금은 20mm 구경 월 금액</caption>
                  <thead>
                    <tr>
                      <th scope="col">도시</th>
                      <th scope="col">상수도</th>
                      <th scope="col">기본요금</th>
                      <th scope="col">하수도</th>
                      <th scope="col">물이용부담금</th>
                      <th scope="col">기준</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.rows.map((row) => (
                      <tr key={row.city}>
                        <th scope="row">
                          <a href={row.sourceUrl} rel="noopener" target="_blank">
                            {row.city}
                          </a>
                        </th>
                        <td>{row.water}</td>
                        <td>{row.meter20}</td>
                        <td>{row.sewer}</td>
                        <td>{row.use}</td>
                        <td>{row.basis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Source tariff={cities} />
            </div>
          ) : null}
          {heating && h ? (
            <div className="rates-block">
              <h2>지역난방 (한국지역난방공사 주택용)</h2>
              <ul>
                <li>기본요금 계약면적 ㎡당 {h.basePerM2.toFixed(2)}원</li>
                <li>사용요금 단일요금 Mcal당 {h.single}원</li>
                <li>
                  계절별 차등 선택 시 Mcal당 봄·가을 {h.spring}원, 여름 {h.summer}원, 겨울 {h.winter}원
                </li>
                <li>부가가치세 별도. 다른 공급사는 요금이 다를 수 있습니다.</li>
              </ul>
              <Source tariff={heating} />
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}
