import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTwZip6 } from '../src/react'

describe('useTwZip6', () => {
  it('應返回初始狀態', () => {
    const { result } = renderHook(() => useTwZip6())

    expect(result.current.cities.length).toBeGreaterThan(0)
    expect(result.current.city).toBeDefined()
    expect(result.current.areas.length).toBeGreaterThan(0)
    expect(result.current.area).toBeDefined()
  })

  it('應在切換縣市時更新行政區', () => {
    const { result } = renderHook(() => useTwZip6())

    act(() => {
      result.current.setCity('臺北市')
    })

    expect(result.current.city).toBe('臺北市')
    expect(result.current.areas).toContain('中正區')
  })

  it('應在切換行政區時更新路名列表', () => {
    const { result } = renderHook(() => useTwZip6())

    act(() => {
      result.current.setCity('臺北市')
    })

    act(() => {
      result.current.setArea('中正區')
    })

    expect(result.current.area).toBe('中正區')
    expect(result.current.roads.length).toBeGreaterThan(0)
  })

  it('應能查詢 6 碼郵遞區號', () => {
    const { result } = renderHook(() => useTwZip6())

    act(() => {
      result.current.setCity('臺北市')
    })

    act(() => {
      result.current.setArea('中正區')
    })

    act(() => {
      result.current.setRoad('三元街')
    })

    act(() => {
      result.current.setNumber(145)
    })

    expect(result.current.zipCode).toMatch(/^\d{6}$/)
    expect(result.current.zip3).toMatch(/^\d{3}$/)
    expect(result.current.result).toBeDefined()
  })

  it('應能搜尋路名', () => {
    const { result } = renderHook(() => useTwZip6())

    act(() => {
      result.current.searchRoads('三元')
    })

    expect(result.current.searchResults.length).toBeGreaterThan(0)
    expect(result.current.searchResults[0]).toHaveProperty('city')
    expect(result.current.searchResults[0]).toHaveProperty('area')
    expect(result.current.searchResults[0]).toHaveProperty('road')
  })

  it('應在切換縣市時重置所有下層選項', () => {
    const { result } = renderHook(() => useTwZip6())

    act(() => {
      result.current.setCity('臺北市')
    })

    act(() => {
      result.current.setArea('中正區')
    })

    act(() => {
      result.current.setRoad('三元街')
    })

    act(() => {
      result.current.setNumber(100)
    })

    act(() => {
      result.current.setLane(5)
    })

    // 切換縣市
    act(() => {
      result.current.setCity('高雄市')
    })

    expect(result.current.city).toBe('高雄市')
    expect(result.current.number).toBeUndefined()
    expect(result.current.lane).toBeUndefined()
    expect(result.current.alley).toBeUndefined()
  })

  it('應提供所有必要的回傳值', () => {
    const { result } = renderHook(() => useTwZip6())

    // 選項列表
    expect(Array.isArray(result.current.cities)).toBe(true)
    expect(Array.isArray(result.current.areas)).toBe(true)
    expect(Array.isArray(result.current.roads)).toBe(true)

    // 選中值
    expect(typeof result.current.city).toBe('string')
    expect(typeof result.current.area).toBe('string')
    expect(typeof result.current.road).toBe('string')

    // Setters
    expect(typeof result.current.setCity).toBe('function')
    expect(typeof result.current.setArea).toBe('function')
    expect(typeof result.current.setRoad).toBe('function')
    expect(typeof result.current.setNumber).toBe('function')
    expect(typeof result.current.setLane).toBe('function')
    expect(typeof result.current.setAlley).toBe('function')

    // 搜尋
    expect(typeof result.current.searchRoads).toBe('function')
    expect(Array.isArray(result.current.searchResults)).toBe(true)

    // 結果
    expect(typeof result.current.zipCode).toBe('string')
    expect(typeof result.current.zip3).toBe('string')
  })
})
