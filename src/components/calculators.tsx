'use client'

import { useState } from 'react'

import {
  applianceKwh,
  calcElectric,
  calcGas,
  calcWaterSeoul,
  type ElectricBill,
  type ElectricData,
  type GasData,
  type Season,
  type Voltage,
  type WaterData,
  won,
} from '@/lib/calc'

const num = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function NumberField({
  id,
  label,
  value,
  onChange,
  step,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  step?: string
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        step={step ?? 'any'}
        type="number"
        value={value}
      />
      {hint ? <p className="calc__hint">{hint}</p> : null}
    </div>
  )
}

function ElectricOptions({
  idPrefix,
  season,
  voltage,
  onSeason,
  onVoltage,
}: {
  idPrefix: string
  season: Season
  voltage: Voltage
  onSeason: (value: Season) => void
  onVoltage: (value: Voltage) => void
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-season`}>사용 시기</label>
        <select id={`${idPrefix}-season`} onChange={(event) => onSeason(event.target.value as Season)} value={season}>
          <option value="normal">봄·가을 (3~6월, 9~11월)</option>
          <option value="summer">여름 (7~8월)</option>
          <option value="winter">겨울 (12~2월)</option>
        </select>
      </div>
      <fieldset>
        <legend>계약 종류</legend>
        <div className="calc__radio">
          <label>
            <input checked={voltage === 'low'} name={`${idPrefix}-voltage`} onChange={() => onVoltage('low')} type="radio" />
            저압
          </label>
          <label>
            <input checked={voltage === 'high'} name={`${idPrefix}-voltage`} onChange={() => onVoltage('high')} type="radio" />
            고압
          </label>
        </div>
      </fieldset>
    </>
  )
}

function ElectricBreakdown({ bill }: { bill: ElectricBill }) {
  return (
    <div className="table-wrap">
      <table className="rate-table">
        <caption>항목별 계산</caption>
        <tbody>
          <tr>
            <th scope="row">기본요금</th>
            <td className="num">{won(bill.base)}</td>
          </tr>
          {bill.lines.map((line) => (
            <tr key={line.label}>
              <th scope="row">
                전력량요금 {line.label} ({line.kwh.toLocaleString('ko-KR')}kWh × {line.rate}원)
              </th>
              <td className="num">{won(Math.floor(line.amount))}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">기후환경요금</th>
            <td className="num">{won(bill.climate)}</td>
          </tr>
          <tr>
            <th scope="row">연료비조정요금</th>
            <td className="num">{won(bill.fuel)}</td>
          </tr>
          <tr>
            <th scope="row">전기요금계</th>
            <td className="num">{won(bill.subtotal)}</td>
          </tr>
          <tr>
            <th scope="row">부가가치세</th>
            <td className="num">{won(bill.vat)}</td>
          </tr>
          <tr>
            <th scope="row">전력산업기반기금</th>
            <td className="num">{won(bill.fund)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">청구요금 합계</th>
            <td className="num">{won(bill.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function ElectricCalculator({ data }: { data: ElectricData }) {
  const [kwh, setKwh] = useState('350')
  const [season, setSeason] = useState<Season>('normal')
  const [voltage, setVoltage] = useState<Voltage>('low')
  const bill = calcElectric(data, { kwh: num(kwh), season, voltage })
  return (
    <form className="calc" onSubmit={(event) => event.preventDefault()}>
      <div className="calc__fields">
        <NumberField id="e-kwh" label="한 달 사용량 (kWh)" onChange={setKwh} step="1" value={kwh} />
        <ElectricOptions idPrefix="e" onSeason={setSeason} onVoltage={setVoltage} season={season} voltage={voltage} />
      </div>
      <div className="calc__total" aria-live="polite">
        <span>예상 청구요금 (TV 수신료 별도)</span>
        <strong>{won(bill.total)}</strong>
      </div>
      <ElectricBreakdown bill={bill} />
    </form>
  )
}

const APPLIANCES = [
  { label: '직접 입력', watts: 0 },
  { label: '에어컨 (한전 예시 1,800W)', watts: 1800 },
  { label: 'TV (한전 예시 150W)', watts: 150 },
  { label: '형광등 20W 4개 (한전 예시 80W)', watts: 80 },
  { label: '공기청정기 (한전 예시 40W)', watts: 40 },
  { label: '초음파식 가습기 (한전 예시 40W)', watts: 40 },
]

export function ApplianceCalculator({ data }: { data: ElectricData }) {
  const [current, setCurrent] = useState('300')
  const [watts, setWatts] = useState('1800')
  const [hours, setHours] = useState('5')
  const [days, setDays] = useState('30')
  const [season, setSeason] = useState<Season>('summer')
  const [voltage, setVoltage] = useState<Voltage>('low')
  const added = applianceKwh(num(watts), num(hours), num(days))
  const before = calcElectric(data, { kwh: num(current), season, voltage })
  const after = calcElectric(data, { kwh: num(current) + added, season, voltage })
  return (
    <form className="calc" onSubmit={(event) => event.preventDefault()}>
      <div className="calc__fields">
        <NumberField id="a-current" label="가전을 빼고 쓰는 한 달 사용량 (kWh)" onChange={setCurrent} step="1" value={current} />
        <div>
          <label htmlFor="a-preset">가전 고르기</label>
          <select
            id="a-preset"
            onChange={(event) => {
              const watt = Number(event.target.value)
              if (watt) setWatts(String(watt))
            }}
            defaultValue="1800"
          >
            {APPLIANCES.map((item) => (
              <option key={item.label} value={item.watts}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <NumberField id="a-watts" label="소비전력 (W)" onChange={setWatts} step="1" value={watts} />
        <NumberField id="a-hours" label="하루 사용 시간" onChange={setHours} value={hours} />
        <NumberField id="a-days" label="한 달 사용 일수" onChange={setDays} step="1" value={days} />
        <ElectricOptions idPrefix="a" onSeason={setSeason} onVoltage={setVoltage} season={season} voltage={voltage} />
      </div>
      <div className="calc__total" aria-live="polite">
        <span>이 가전 때문에 늘어나는 요금 ({added.toLocaleString('ko-KR')}kWh)</span>
        <strong>{won(after.total - before.total)}</strong>
        <p className="calc__hint">
          {won(before.total)}에서 {won(after.total)}로 바뀝니다.
        </p>
      </div>
    </form>
  )
}

export function GasCalculator({ data }: { data: GasData }) {
  const [regionId, setRegionId] = useState(data.regions[0].id)
  const [unit, setUnit] = useState<'mj' | 'm3'>('mj')
  const [amount, setAmount] = useState('2000')
  const [factor, setFactor] = useState(String(data.defaultMjPerM3))
  const [use, setUse] = useState<'heat' | 'cook'>('heat')
  const region = data.regions.find((item) => item.id === regionId) ?? data.regions[0]
  const mj = unit === 'mj' ? num(amount) : num(amount) * num(factor)
  const bill = calcGas(data, region, { mj, use })
  return (
    <form className="calc" onSubmit={(event) => event.preventDefault()}>
      <div className="calc__fields">
        <div>
          <label htmlFor="g-region">지역</label>
          <select id="g-region" onChange={(event) => setRegionId(event.target.value)} value={regionId}>
            {data.regions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.supplier})
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend>입력 단위</legend>
          <div className="calc__radio">
            <label>
              <input checked={unit === 'mj'} name="g-unit" onChange={() => setUnit('mj')} type="radio" />
              열량(MJ)
            </label>
            <label>
              <input checked={unit === 'm3'} name="g-unit" onChange={() => setUnit('m3')} type="radio" />
              부피(㎥)
            </label>
          </div>
        </fieldset>
        <NumberField
          id="g-amount"
          label={unit === 'mj' ? '고지서의 사용 열량 (MJ)' : '고지서의 사용량 (㎥)'}
          onChange={setAmount}
          value={amount}
        />
        {unit === 'm3' ? (
          <NumberField
            hint={`공식 범위는 ${data.minMjPerM3}~${data.maxMjPerM3}MJ입니다. 고지서 값이 있으면 그 값으로 바꿔 주세요.`}
            id="g-factor"
            label="㎥당 열량 (MJ, 온압보정 포함)"
            onChange={setFactor}
            value={factor}
          />
        ) : null}
        <fieldset>
          <legend>용도</legend>
          <div className="calc__radio">
            <label>
              <input checked={use === 'heat'} name="g-use" onChange={() => setUse('heat')} type="radio" />
              취사·난방 겸용
            </label>
            <label>
              <input checked={use === 'cook'} name="g-use" onChange={() => setUse('cook')} type="radio" />
              취사 전용
            </label>
          </div>
        </fieldset>
      </div>
      <div className="calc__total" aria-live="polite">
        <span>
          예상 요금 ({region.name}, {Math.round(mj).toLocaleString('ko-KR')}MJ)
        </span>
        <strong>약 {won(bill.total)}</strong>
      </div>
      <div className="table-wrap">
        <table className="rate-table">
          <caption>항목별 계산</caption>
          <tbody>
            <tr>
              <th scope="row">기본요금</th>
              <td className="num">{won(bill.base)}</td>
            </tr>
            <tr>
              <th scope="row">사용요금</th>
              <td className="num">{won(bill.usage)}</td>
            </tr>
            <tr>
              <th scope="row">부가가치세 10%</th>
              <td className="num">{won(bill.vat)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">합계</th>
              <td className="num">약 {won(bill.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </form>
  )
}

export function WaterCalculator({ data }: { data: WaterData }) {
  const [m3, setM3] = useState('20')
  const [months, setMonths] = useState('1')
  const [households, setHouseholds] = useState('1')
  const [mm, setMm] = useState('15')
  const [sewerRate, setSewerRate] = useState(String(data.sewerRate))
  const bill = calcWaterSeoul(
    { ...data, sewerRate: Number(sewerRate) },
    { m3: num(m3), months: num(months), households: num(households), mm: Number(mm) },
  )
  return (
    <form className="calc" onSubmit={(event) => event.preventDefault()}>
      <div className="calc__fields">
        <NumberField id="w-m3" label="고지서의 사용량 (㎥)" onChange={setM3} value={m3} />
        <div>
          <label htmlFor="w-months">고지 기간</label>
          <select id="w-months" onChange={(event) => setMonths(event.target.value)} value={months}>
            <option value="1">1개월</option>
            <option value="2">2개월</option>
          </select>
        </div>
        <NumberField id="w-households" label="계량기 하나를 쓰는 세대 수" onChange={setHouseholds} step="1" value={households} />
        <div>
          <label htmlFor="w-mm">계량기 구경</label>
          <select id="w-mm" onChange={(event) => setMm(event.target.value)} value={mm}>
            {data.meterCharge.map((row) => (
              <option key={row.mm} value={row.mm}>
                {row.mm}mm (월 {row.charge.toLocaleString('ko-KR')}원)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="w-year">하수도 요율 적용 연도</label>
          <select id="w-year" onChange={(event) => setSewerRate(event.target.value)} value={sewerRate}>
            {data.sewerSchedule.map((row) => (
              <option key={row.from} value={row.rate}>
                {row.from} (㎥당 {row.rate}원)
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="calc__total" aria-live="polite">
        <span>예상 요금 총계</span>
        <strong>{won(bill.total)}</strong>
      </div>
      <div className="table-wrap">
        <table className="rate-table">
          <caption>항목별 계산 (세대당 월평균 {bill.avgPerHousehold}㎥)</caption>
          <tbody>
            <tr>
              <th scope="row">상수도 사용요금</th>
              <td className="num">{won(bill.usageCharge)}</td>
            </tr>
            <tr>
              <th scope="row">계량기 기본요금</th>
              <td className="num">{won(bill.meter)}</td>
            </tr>
            <tr>
              <th scope="row">하수도요금</th>
              <td className="num">{won(bill.sewer)}</td>
            </tr>
            <tr>
              <th scope="row">물이용부담금</th>
              <td className="num">{won(bill.useCharge)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">요금 총계</th>
              <td className="num">{won(bill.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </form>
  )
}
