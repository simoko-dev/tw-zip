import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useTwZip6 } from '../src/vue'

describe('useTwZip6 (Vue)', () => {
  it('應返回初始狀態', () => {
    const { cities, city, areas, area, roads, road } = useTwZip6()

    expect(cities.length).toBeGreaterThan(0)
    expect(city.value).toBeDefined()
    expect(areas.value.length).toBeGreaterThan(0)
    expect(area.value).toBeDefined()
    expect(Array.isArray(roads.value)).toBe(true)
    expect(typeof road.value).toBe('string')
  })

  it('應在切換縣市時更新行政區', async () => {
    const { city, areas } = useTwZip6()

    city.value = '臺北市'
    await nextTick()

    expect(areas.value).toContain('中正區')
  })

  it('應在切換行政區時更新路名列表', async () => {
    const { city, area, roads } = useTwZip6()

    city.value = '臺北市'
    await nextTick()

    area.value = '中正區'
    await nextTick()

    expect(roads.value.length).toBeGreaterThan(0)
  })

  it('應能查詢 6 碼郵遞區號', async () => {
    const { city, area, road, number, zipCode, zip3, result } = useTwZip6()

    city.value = '臺北市'
    await nextTick()

    area.value = '中正區'
    await nextTick()

    road.value = '三元街'
    await nextTick()

    number.value = 145
    await nextTick()

    expect(zipCode.value).toMatch(/^\d{6}$/)
    expect(zip3.value).toMatch(/^\d{3}$/)
    expect(result.value).toBeDefined()
  })

  it('應能搜尋路名', () => {
    const { searchRoads, searchResults } = useTwZip6()

    searchRoads('三元')

    expect(searchResults.value.length).toBeGreaterThan(0)
    expect(searchResults.value[0]).toHaveProperty('city')
    expect(searchResults.value[0]).toHaveProperty('area')
    expect(searchResults.value[0]).toHaveProperty('road')
  })

  it('應在切換縣市時重置所有下層選項', async () => {
    const { city, area, road, number, lane, alley } = useTwZip6()

    city.value = '臺北市'
    await nextTick()

    area.value = '中正區'
    await nextTick()

    road.value = '三元街'
    await nextTick()

    number.value = 100
    lane.value = 5
    alley.value = 3
    await nextTick()

    // 切換縣市
    city.value = '高雄市'
    await nextTick()

    expect(number.value).toBeUndefined()
    expect(lane.value).toBeUndefined()
    expect(alley.value).toBeUndefined()
  })

  it('應提供所有必要的回傳值', () => {
    const result = useTwZip6()

    // 選項列表
    expect(Array.isArray(result.cities)).toBe(true)
    expect(Array.isArray(result.areas.value)).toBe(true)
    expect(Array.isArray(result.roads.value)).toBe(true)

    // 選中值
    expect(typeof result.city.value).toBe('string')
    expect(typeof result.area.value).toBe('string')
    expect(typeof result.road.value).toBe('string')

    // 搜尋
    expect(typeof result.searchRoads).toBe('function')
    expect(Array.isArray(result.searchResults.value)).toBe(true)

    // 結果
    expect(typeof result.zipCode.value).toBe('string')
    expect(typeof result.zip3.value).toBe('string')
  })
})
