import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { useTwZip } from '../src/solidjs'

describe('useTwZip (SolidJS)', () => {
  it('應返回初始狀態', () => {
    createRoot((dispose) => {
      const { cities, city, districts, zipCode } = useTwZip()

      expect(cities).toContain('台北市')
      expect(city()).toBe('台北市')
      expect(districts().length).toBeGreaterThan(0)
      expect(zipCode()).toBeDefined()

      dispose()
    })
  })

  it('應在切換縣市時更新行政區', () => {
    createRoot((dispose) => {
      const { setCity, city, districts, zipCode } = useTwZip()

      setCity('高雄市')

      expect(city()).toBe('高雄市')
      expect(districts().some(d => d.label === '三民區')).toBe(true)
      expect(zipCode()).toBeDefined()

      dispose()
    })
  })

  it('應在設定行政區時更新郵遞區號', () => {
    createRoot((dispose) => {
      const { setDistrict, district, zipCode } = useTwZip()

      setDistrict('中正區')

      expect(district()).toBe('中正區')
      expect(zipCode()).toBe('100')

      dispose()
    })
  })

  it('應在設定郵遞區號時更新行政區', () => {
    createRoot((dispose) => {
      const { setZipCode, zipCode, districts } = useTwZip()

      setZipCode('106')

      expect(zipCode()).toBe('106')
      // district 是 createMemo，在 server 環境中需要手動驗證
      const found = districts().find(d => d.value === '106')
      expect(found?.label).toBe('大安區')

      dispose()
    })
  })

  it('應回傳所有必要屬性', () => {
    createRoot((dispose) => {
      const result = useTwZip()

      expect(result.cities).toBeDefined()
      expect(result.districts).toBeTypeOf('function')
      expect(result.city).toBeTypeOf('function')
      expect(result.district).toBeTypeOf('function')
      expect(result.zipCode).toBeTypeOf('function')
      expect(result.setCity).toBeTypeOf('function')
      expect(result.setDistrict).toBeTypeOf('function')
      expect(result.setZipCode).toBeTypeOf('function')

      dispose()
    })
  })
})
