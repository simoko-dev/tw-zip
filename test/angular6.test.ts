import { describe, expect, it } from 'vitest'

import { TwZip6Service } from '../src/angular'

describe('TwZip6Service', () => {
  it('應返回初始狀態', () => {
    const service = new TwZip6Service()

    expect(service.cities.length).toBeGreaterThan(0)
    expect(service.city()).toBeDefined()
    expect(service.areas().length).toBeGreaterThan(0)
    expect(service.area()).toBeDefined()
  })

  it('應在切換縣市時更新行政區', () => {
    const service = new TwZip6Service()

    service.setCity('臺北市')

    expect(service.city()).toBe('臺北市')
    expect(service.areas()).toContain('中正區')
  })

  it('應在切換行政區時更新路名列表', () => {
    const service = new TwZip6Service()

    service.setCity('臺北市')
    service.setArea('中正區')

    expect(service.area()).toBe('中正區')
    expect(service.roads().length).toBeGreaterThan(0)
  })

  it('應能查詢 6 碼郵遞區號', () => {
    const service = new TwZip6Service()

    service.setCity('臺北市')
    service.setArea('中正區')
    service.setRoad('三元街')
    service.setNumber(145)

    expect(service.zipCode()).toMatch(/^\d{6}$/)
    expect(service.zip3()).toMatch(/^\d{3}$/)
    expect(service.result()).toBeDefined()
  })

  it('應能搜尋路名', () => {
    const service = new TwZip6Service()

    service.searchRoads('三元')

    expect(service.searchResults().length).toBeGreaterThan(0)
    expect(service.searchResults()[0]).toHaveProperty('city')
    expect(service.searchResults()[0]).toHaveProperty('area')
    expect(service.searchResults()[0]).toHaveProperty('road')
  })

  it('應在切換縣市時重置所有下層選項', () => {
    const service = new TwZip6Service()

    service.setCity('臺北市')
    service.setArea('中正區')
    service.setRoad('三元街')
    service.setNumber(100)
    service.setLane(5)

    // 切換縣市
    service.setCity('高雄市')

    expect(service.city()).toBe('高雄市')
    expect(service.number()).toBeUndefined()
    expect(service.lane()).toBeUndefined()
    expect(service.alley()).toBeUndefined()
  })

  it('應提供所有必要的屬性與方法', () => {
    const service = new TwZip6Service()

    // 選項列表
    expect(Array.isArray(service.cities)).toBe(true)
    expect(typeof service.areas).toBe('function')
    expect(typeof service.roads).toBe('function')

    // 選中值
    expect(typeof service.city).toBe('function')
    expect(typeof service.area).toBe('function')
    expect(typeof service.road).toBe('function')

    // Setters
    expect(typeof service.setCity).toBe('function')
    expect(typeof service.setArea).toBe('function')
    expect(typeof service.setRoad).toBe('function')
    expect(typeof service.setNumber).toBe('function')
    expect(typeof service.setLane).toBe('function')
    expect(typeof service.setAlley).toBe('function')

    // 搜尋
    expect(typeof service.searchRoads).toBe('function')
    expect(typeof service.searchResults).toBe('function')

    // 結果
    expect(typeof service.zipCode).toBe('function')
    expect(typeof service.zip3).toBe('function')
  })
})
