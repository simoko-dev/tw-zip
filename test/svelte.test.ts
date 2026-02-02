import { get } from 'svelte/store'
import { describe, expect, it } from 'vitest'
import { createTwZip } from '../src/svelte'

describe('createTwZip (Svelte)', () => {
  it('應返回初始狀態', () => {
    const { cities, city, districts, zipCode } = createTwZip()

    expect(get(cities)).toContain('台北市')
    expect(get(city)).toBe('台北市')
    expect(get(districts).length).toBeGreaterThan(0)
    expect(get(zipCode)).toBeDefined()
  })

  it('應在切換縣市時更新行政區', () => {
    const { city, districts, zipCode } = createTwZip()

    city.set('高雄市')

    expect(get(districts).some(d => d.label === '三民區')).toBe(true)
    expect(get(zipCode)).toBeDefined()
  })

  it('應在設定行政區時更新郵遞區號', () => {
    const { setDistrict, zipCode, district } = createTwZip()

    setDistrict('中正區')

    expect(get(district)).toBe('中正區')
    expect(get(zipCode)).toBe('100')
  })

  it('應在設定郵遞區號時更新行政區', () => {
    const { setZipCode, district, zipCode } = createTwZip()

    setZipCode('106')

    expect(get(zipCode)).toBe('106')
    expect(get(district)).toBe('大安區')
  })

  it('應回傳所有必要屬性', () => {
    const result = createTwZip()

    expect(result.cities).toBeDefined()
    expect(result.districts).toBeDefined()
    expect(result.city).toBeDefined()
    expect(result.district).toBeDefined()
    expect(result.zipCode).toBeDefined()
    expect(result.setCity).toBeTypeOf('function')
    expect(result.setDistrict).toBeTypeOf('function')
    expect(result.setZipCode).toBeTypeOf('function')
  })
})
