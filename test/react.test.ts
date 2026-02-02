import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTwZip } from '../src/react'

describe('useTwZip', () => {
  it('應返回初始狀態', () => {
    const { result } = renderHook(() => useTwZip())

    expect(result.current.cities).toContain('台北市')
    expect(result.current.city).toBe('台北市')
    expect(result.current.districts.length).toBeGreaterThan(0)
    expect(result.current.district).toBeDefined()
    expect(result.current.zipCode).toBeDefined()
  })

  it('應在切換縣市時更新行政區', () => {
    const { result } = renderHook(() => useTwZip())

    act(() => {
      result.current.setCity('高雄市')
    })

    expect(result.current.city).toBe('高雄市')
    expect(result.current.districts.some(d => d.label === '三民區')).toBe(true)
  })

  it('應在切換行政區時更新郵遞區號', () => {
    const { result } = renderHook(() => useTwZip())

    act(() => {
      result.current.setCity('高雄市')
    })

    act(() => {
      result.current.setDistrict('三民區')
    })

    expect(result.current.district).toBe('三民區')
    expect(result.current.zipCode).toBe('807')
  })

  it('應提供所有必要的回傳值', () => {
    const { result } = renderHook(() => useTwZip())

    expect(typeof result.current.cities).toBe('object')
    expect(typeof result.current.districts).toBe('object')
    expect(typeof result.current.city).toBe('string')
    expect(typeof result.current.setCity).toBe('function')
    expect(typeof result.current.district).toBe('string')
    expect(typeof result.current.setDistrict).toBe('function')
    expect(typeof result.current.zipCode).toBe('string')
    expect(typeof result.current.setZipCode).toBe('function')
  })

  it('應在設定郵遞區號時更新行政區', () => {
    const { result } = renderHook(() => useTwZip())

    act(() => {
      result.current.setCity('高雄市')
    })

    act(() => {
      result.current.setZipCode('807')
    })

    expect(result.current.zipCode).toBe('807')
    expect(result.current.district).toBe('三民區')
  })
})
