// Bill formulas. Rounding follows each agency's published method; see calc.test.ts for the official examples.

export type Tier = { upTo: number | null; base: number; rate: number }
export type Season = 'normal' | 'summer' | 'winter'
export type Voltage = 'low' | 'high'

export type ElectricData = {
  low: { normal: Tier[]; summer: Tier[]; superUserRate: number; minimumCharge: number }
  high: { normal: Tier[]; summer: Tier[]; superUserRate: number; minimumCharge: number }
  superUserOver: number
  climatePerKwh: number
  fuelPerKwh: number
  vatRate: number
  fundRate: number
}

export type EnergyLine = { label: string; kwh: number; rate: number; amount: number }

export type ElectricBill = {
  base: number
  energy: number
  lines: EnergyLine[]
  climate: number
  fuel: number
  subtotal: number
  vat: number
  fund: number
  total: number
}

export const calcElectric = (
  data: ElectricData,
  input: { kwh: number; voltage: Voltage; season: Season },
): ElectricBill => {
  const kwh = Math.max(0, Math.floor(input.kwh))
  const plan = data[input.voltage]
  const tiers = input.season === 'summer' ? plan.summer : plan.normal
  const tier = tiers.find((t) => t.upTo === null || kwh <= t.upTo) ?? tiers[tiers.length - 1]

  const lines: EnergyLine[] = []
  let from = 0
  for (const t of tiers) {
    const to = t.upTo === null ? kwh : Math.min(kwh, t.upTo)
    if (to > from) lines.push({ label: `${from + 1}~${to}kWh`, kwh: to - from, rate: t.rate, amount: (to - from) * t.rate })
    from = t.upTo ?? from
    if (kwh <= from) break
  }
  // The top rate applies in summer and winter only, to the part above the threshold.
  if (input.season !== 'normal' && kwh > data.superUserOver) {
    const over = kwh - data.superUserOver
    const last = lines[lines.length - 1]
    last.kwh -= over
    last.label = last.label.replace(/~\d+kWh$/, `~${data.superUserOver}kWh`)
    last.amount = last.kwh * last.rate
    lines.push({
      label: `${data.superUserOver}kWh 초과`,
      kwh: over,
      rate: plan.superUserRate,
      amount: over * plan.superUserRate,
    })
  }

  const energy = Math.floor(lines.reduce((sum, line) => sum + line.amount, 0) + 1e-9)
  const climate = Math.floor(kwh * data.climatePerKwh + 1e-9)
  const fuel = Math.floor(kwh * data.fuelPerKwh + 1e-9)
  const subtotal = Math.max(tier.base + energy + climate + fuel, plan.minimumCharge)
  const vat = Math.round(subtotal * data.vatRate)
  const fund = Math.floor((subtotal * data.fundRate) / 10 + 1e-9) * 10
  const total = Math.floor((subtotal + vat + fund) / 10) * 10
  return { base: tier.base, energy, lines, climate, fuel, subtotal, vat, fund, total }
}

export const applianceKwh = (watts: number, hoursPerDay: number, days: number): number =>
  (watts * hoursPerDay * days) / 1000

export type GasRegion = {
  id: string
  name: string
  supplier: string
  baseHeat: number
  baseCook: number
  rateCook: number
  rateHeat: number
  effective: string
  sourceLabel: string
  sourceUrl: string
}

export type GasData = {
  regions: GasRegion[]
  cookLimitMj: number
  vatRate: number
  defaultMjPerM3: number
  minMjPerM3: number
  maxMjPerM3: number
}

export type GasBill = {
  mj: number
  base: number
  usage: number
  vat: number
  total: number
}

// shortcut: suppliers round the last digits differently and publish no unit, so the result is shown as "약".
export const calcGas = (
  data: GasData,
  region: GasRegion,
  input: { mj: number; use: 'heat' | 'cook' },
): GasBill => {
  const mj = Math.max(0, input.mj)
  const base = input.use === 'cook' ? region.baseCook : region.baseHeat
  const usage =
    input.use === 'cook'
      ? mj * region.rateCook
      : Math.min(mj, data.cookLimitMj) * region.rateCook + Math.max(0, mj - data.cookLimitMj) * region.rateHeat
  const vat = (base + usage) * data.vatRate
  return { mj, base, usage: Math.floor(usage), vat: Math.floor(vat), total: Math.floor(base + usage + vat) }
}

export type WaterData = {
  waterRate: number
  sewerRate: number
  sewerSchedule: { from: string; rate: number }[]
  useCharge: number
  meterCharge: { mm: number; charge: number }[]
}

export type WaterBill = {
  avgPerHousehold: number
  usageCharge: number
  meter: number
  water: number
  sewer: number
  useCharge: number
  total: number
}

const floorTen = (value: number) => Math.floor((value + 1e-6) / 10) * 10

// Seoul's published method: a household's monthly average keeps one decimal, then each line drops the last digit.
export const calcWaterSeoul = (
  data: WaterData,
  input: { m3: number; months: number; households: number; mm: number },
): WaterBill => {
  const months = Math.max(1, Math.floor(input.months))
  const households = Math.max(1, Math.floor(input.households))
  const m3 = Math.max(0, input.m3)
  const avgPerHousehold = Math.floor((m3 / months / households) * 10 + 1e-9) / 10
  const scale = households * months
  const usageCharge = floorTen(avgPerHousehold * data.waterRate * scale)
  const monthlyMeter = data.meterCharge.find((row) => row.mm === input.mm)?.charge ?? data.meterCharge[0].charge
  const meter = monthlyMeter * months
  const sewer = floorTen(avgPerHousehold * data.sewerRate * scale)
  const useCharge = floorTen(avgPerHousehold * data.useCharge * scale)
  const water = usageCharge + meter
  return { avgPerHousehold, usageCharge, meter, water, sewer, useCharge, total: water + sewer + useCharge }
}

export const won = (amount: number): string => `${Math.round(amount).toLocaleString('ko-KR')}원`
