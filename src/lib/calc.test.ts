import { describe, expect, it } from 'vitest'

import { tariffs } from '../../scripts/tariffs'
import { applianceKwh, calcElectric, calcGas, calcWaterSeoul, type ElectricData, type GasData, type WaterData } from './calc'

const data = <T>(slug: string) => tariffs.find((t) => t.slug === slug)?.data as T
const electric = data<ElectricData>('electricity-residential')
const gas = data<GasData>('city-gas')
const water = data<WaterData>('water-seoul')

describe('calcElectric', () => {
  it('matches the itemized 350kWh example', () => {
    expect(calcElectric(electric, { kwh: 350, voltage: 'low', season: 'normal' })).toMatchObject({
      base: 1600,
      energy: 56190,
      climate: 3150,
      fuel: 1750,
      subtotal: 62690,
      vat: 6269,
      fund: 1690,
      total: 70640,
    })
  })

  // Subtotals agree with the KEPCO usage table; totals use the current 2.7% fund.
  it.each([
    [350, 'low', 'summer', 59980],
    [300, 'low', 'normal', 57760],
    [451, 'low', 'summer', 92530],
    [1000, 'low', 'normal', 307220],
    [350, 'high', 'normal', 60010],
    [451, 'high', 'summer', 79120],
    [1000, 'high', 'normal', 249330],
  ] as const)('%ikWh %s %s = %i', (kwh, voltage, season, total) => {
    expect(calcElectric(electric, { kwh, voltage, season }).total).toBe(total)
  })

  it('matches the official 300kWh energy charge', () => {
    expect(calcElectric(electric, { kwh: 300, voltage: 'low', season: 'normal' }).energy).toBe(45460)
  })

  it('charges the top rate above 1,000kWh only in summer and winter', () => {
    const normal = calcElectric(electric, { kwh: 1100, voltage: 'low', season: 'normal' })
    const winter = calcElectric(electric, { kwh: 1100, voltage: 'low', season: 'winter' })
    expect(winter.energy - normal.energy).toBe(Math.floor(100 * (736.2 - 307.3) + 1e-9))
    expect(normal.lines).toHaveLength(3)
    expect(winter.lines).toHaveLength(4)
    expect(winter.lines[3].kwh).toBe(100)
    expect(winter.lines[2].kwh).toBe(600)
  })

  it('stops at the tier boundary and applies the minimum charge', () => {
    expect(calcElectric(electric, { kwh: 200, voltage: 'low', season: 'normal' }).base).toBe(910)
    expect(calcElectric(electric, { kwh: 201, voltage: 'low', season: 'normal' }).base).toBe(1600)
    expect(calcElectric(electric, { kwh: 0, voltage: 'low', season: 'normal' }).subtotal).toBe(1000)
  })
})

describe('applianceKwh', () => {
  it('matches the KEPCO examples', () => {
    expect(applianceKwh(150, 6, 30)).toBe(27)
    expect(applianceKwh(1800, 5, 30)).toBe(270)
    expect(applianceKwh(40, 4, 30)).toBe(4.8)
  })
})

describe('calcGas', () => {
  const region = (id: string) => gas.regions.find((r) => r.id === id)!

  it('follows the supplier formula', () => {
    expect(calcGas(gas, region('seoul'), { mj: 1000, use: 'heat' }).total).toBe(26154)
  })

  it('uses the cooking rate up to 516MJ where the two rates differ', () => {
    const bill = calcGas(gas, region('gwangju'), { mj: 1000, use: 'heat' })
    expect(bill.usage).toBe(Math.floor(516 * 22.0252 + 484 * 23.297))
  })

  it('uses the cooking base charge for cooking-only supply', () => {
    expect(calcGas(gas, region('sejong'), { mj: 100, use: 'cook' }).base).toBe(2533)
    expect(calcGas(gas, region('sejong'), { mj: 100, use: 'heat' }).base).toBe(820)
  })
})

describe('calcWaterSeoul', () => {
  it('matches the official two-month, four-household example', () => {
    expect(calcWaterSeoul(water, { m3: 273, months: 2, households: 4, mm: 20 })).toMatchObject({
      avgPerHousehold: 34.1,
      usageCharge: 158220,
      meter: 6000,
      water: 164220,
      sewer: 130940,
      useCharge: 46370,
      total: 341530,
    })
  })
})
