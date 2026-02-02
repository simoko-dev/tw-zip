import { get } from 'svelte/store'
import { describe, expect, it } from 'vitest'
import { createTwZip6 } from '../src/svelte/useTwZip6'

describe('createTwZip6 (Svelte)', () => {
  it('應返回初始狀態', () => {
    const { cities, city, areas, roads } = createTwZip6()

    expect(get(cities).length).toBeGreaterThan(0)
    expect(get(city)).toBeDefined()
    expect(get(areas).length).toBeGreaterThan(0)
    expect(get(roads).length).toBeGreaterThan(0)
  })

  it('應在切換縣市時更新行政區', () => {
    const { setCity, city, areas } = createTwZip6()

    setCity('高雄市')

    expect(get(city)).toBe('高雄市')
    expect(get(areas)).toContain('三民區')
  })

  it('應在切換行政區時更新路名', () => {
    const { setArea, area, roads } = createTwZip6()

    setArea('中山區')

    expect(get(area)).toBe('中山區')
    expect(get(roads).length).toBeGreaterThan(0)
  })

  it('應能計算 6 碼郵遞區號', () => {
    const { setArea, setRoad, zipCode, zip3 } = createTwZip6()

    setArea('中正區')
    setRoad('三元街')

    expect(get(zipCode)).toMatch(/^\d{6}$/)
    expect(get(zip3)).toMatch(/^\d{3}$/)
  })

  it('應能搜尋路名', () => {
    const { searchRoads, searchResults } = createTwZip6()

    searchRoads('三元')

    expect(get(searchResults).length).toBeGreaterThan(0)
    expect(get(searchResults)[0].road).toContain('三元')
  })

  it('應回傳所有必要屬性', () => {
    const result = createTwZip6()

    expect(result.cities).toBeDefined()
    expect(result.areas).toBeDefined()
    expect(result.roads).toBeDefined()
    expect(result.city).toBeDefined()
    expect(result.area).toBeDefined()
    expect(result.road).toBeDefined()
    expect(result.number).toBeDefined()
    expect(result.lane).toBeDefined()
    expect(result.alley).toBeDefined()
    expect(result.setCity).toBeTypeOf('function')
    expect(result.setArea).toBeTypeOf('function')
    expect(result.setRoad).toBeTypeOf('function')
    expect(result.setNumber).toBeTypeOf('function')
    expect(result.setLane).toBeTypeOf('function')
    expect(result.setAlley).toBeTypeOf('function')
    expect(result.searchRoads).toBeTypeOf('function')
    expect(result.searchResults).toBeDefined()
    expect(result.zipCode).toBeDefined()
    expect(result.zip3).toBeDefined()
  })

  it('應在切換行政區時重置路名', () => {
    const { setArea, road, number } = createTwZip6()

    setArea('大安區')

    expect(get(road)).toBeDefined()
    expect(get(number)).toBeUndefined()
  })
})
