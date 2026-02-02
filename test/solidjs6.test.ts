import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { useTwZip6 } from '../src/solidjs/useTwZip6'

describe('useTwZip6 (SolidJS)', () => {
  it('應返回初始狀態', () => {
    createRoot((dispose) => {
      const { cities, city, areas, roads } = useTwZip6()

      expect(cities.length).toBeGreaterThan(0)
      expect(city()).toBeDefined()
      expect(areas().length).toBeGreaterThan(0)
      expect(roads().length).toBeGreaterThan(0)

      dispose()
    })
  })

  it('應在切換縣市時更新行政區', () => {
    createRoot((dispose) => {
      const { setCity, city, areas } = useTwZip6()

      setCity('高雄市')

      expect(city()).toBe('高雄市')
      expect(areas()).toContain('三民區')

      dispose()
    })
  })

  it('應在切換行政區時更新路名', () => {
    createRoot((dispose) => {
      const { setArea, area, roads } = useTwZip6()

      setArea('中山區')

      expect(area()).toBe('中山區')
      expect(roads().length).toBeGreaterThan(0)

      dispose()
    })
  })

  it('應能計算 6 碼郵遞區號', () => {
    createRoot((dispose) => {
      const { setArea, setRoad, zipCode, zip3 } = useTwZip6()

      setArea('中正區')
      setRoad('三元街')

      expect(zipCode()).toMatch(/^\d{6}$/)
      expect(zip3()).toMatch(/^\d{3}$/)

      dispose()
    })
  })

  it('應能搜尋路名', () => {
    createRoot((dispose) => {
      const { searchRoads, searchResults } = useTwZip6()

      searchRoads('三元')

      expect(searchResults().length).toBeGreaterThan(0)
      expect(searchResults()[0].road).toContain('三元')

      dispose()
    })
  })

  it('應回傳所有必要屬性', () => {
    createRoot((dispose) => {
      const result = useTwZip6()

      expect(result.cities).toBeDefined()
      expect(result.areas).toBeTypeOf('function')
      expect(result.roads).toBeTypeOf('function')
      expect(result.city).toBeTypeOf('function')
      expect(result.area).toBeTypeOf('function')
      expect(result.road).toBeTypeOf('function')
      expect(result.number).toBeTypeOf('function')
      expect(result.lane).toBeTypeOf('function')
      expect(result.alley).toBeTypeOf('function')
      expect(result.setCity).toBeTypeOf('function')
      expect(result.setArea).toBeTypeOf('function')
      expect(result.setRoad).toBeTypeOf('function')
      expect(result.setNumber).toBeTypeOf('function')
      expect(result.setLane).toBeTypeOf('function')
      expect(result.setAlley).toBeTypeOf('function')
      expect(result.searchRoads).toBeTypeOf('function')
      expect(result.searchResults).toBeTypeOf('function')
      expect(result.zipCode).toBeTypeOf('function')
      expect(result.zip3).toBeTypeOf('function')

      dispose()
    })
  })

  it('應在切換行政區時重置路名', () => {
    createRoot((dispose) => {
      const { setArea, road, number } = useTwZip6()

      setArea('大安區')

      expect(road()).toBeDefined()
      expect(number()).toBeUndefined()

      dispose()
    })
  })
})
