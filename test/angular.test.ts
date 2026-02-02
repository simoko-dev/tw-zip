import { describe, expect, it } from 'vitest'

import { TwZipService } from '../src/angular'

describe('TwZipService', () => {
  it('應返回初始狀態', () => {
    const service = new TwZipService()

    expect(service.cities).toContain('台北市')
    expect(service.city()).toBe('台北市')
    expect(service.districts().length).toBeGreaterThan(0)
    expect(service.district()).toBeDefined()
    expect(service.zipCode()).toBeDefined()
  })

  it('應在切換縣市時更新行政區', () => {
    const service = new TwZipService()

    service.setCity('高雄市')

    expect(service.city()).toBe('高雄市')
    expect(service.districts().some(d => d.label === '三民區')).toBe(true)
  })

  it('應在切換行政區時更新郵遞區號', () => {
    const service = new TwZipService()

    service.setCity('高雄市')
    service.setDistrict('三民區')

    expect(service.district()).toBe('三民區')
    expect(service.zipCode()).toBe('807')
  })

  it('應提供所有必要的屬性與方法', () => {
    const service = new TwZipService()

    expect(Array.isArray(service.cities)).toBe(true)
    expect(typeof service.city).toBe('function')
    expect(typeof service.districts).toBe('function')
    expect(typeof service.district).toBe('function')
    expect(typeof service.zipCode).toBe('function')
    expect(typeof service.setCity).toBe('function')
    expect(typeof service.setDistrict).toBe('function')
    expect(typeof service.setZipCode).toBe('function')
  })

  it('應在設定郵遞區號時更新行政區', () => {
    const service = new TwZipService()

    service.setCity('高雄市')
    service.setZipCode('807')

    expect(service.zipCode()).toBe('807')
    expect(service.district()).toBe('三民區')
  })
})
