import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useTwZip } from '../src/vue'

describe('useTwZip (Vue)', () => {
  it('應返回初始狀態', () => {
    const { cities, city, districts, district, zipCode } = useTwZip()

    expect(cities).toContain('台北市')
    expect(city.value).toBe('台北市')
    expect(districts.value.length).toBeGreaterThan(0)
    expect(district.value).toBeDefined()
    expect(zipCode.value).toBeDefined()
  })

  it('應在切換縣市時更新行政區', async () => {
    const { city, districts } = useTwZip()

    city.value = '高雄市'
    await nextTick()

    expect(districts.value.some(d => d.label === '三民區')).toBe(true)
  })

  it('應在切換郵遞區號時更新行政區', async () => {
    const { city, zipCode, district } = useTwZip()

    city.value = '高雄市'
    await nextTick()

    zipCode.value = '807'
    await nextTick()

    expect(district.value).toBe('三民區')
  })

  it('應提供所有必要的回傳值', () => {
    const result = useTwZip()

    expect(Array.isArray(result.cities)).toBe(true)
    expect(typeof result.city.value).toBe('string')
    expect(Array.isArray(result.districts.value)).toBe(true)
    expect(typeof result.zipCode.value).toBe('string')
  })

  it('應在設定行政區時更新郵遞區號', async () => {
    const { city, district, zipCode } = useTwZip()

    city.value = '高雄市'
    await nextTick()

    district.value = '三民區'
    await nextTick()

    expect(zipCode.value).toBe('807')
  })

  it('default export 應與 named export 相同', async () => {
    const defaultExport = await import('../src/vue')
    expect(typeof defaultExport.default).toBe('function')
    expect(defaultExport.default).toBe(defaultExport.useTwZip)
  })
})
