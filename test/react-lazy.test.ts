import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTwZip6 } from '../src/react/lazy'
import { clearCache } from '../src/zip6/loader'

// Mock fetch
const mockCitiesData = {
  cities: ['臺北市', '高雄市'],
  zip3: {
    臺北市: { 中正區: '100', 大安區: '106' },
    高雄市: { 三民區: '807', 前鎮區: '806' },
  },
}

const mockTaipeiData = {
  中正區: {
    三元街: '053,0,0,0|060,0,0,0,0,0,131,0,9999',
    中山南路: '009,0,0,0',
  },
  大安區: {
    信義路: '001,0,0,0',
  },
}

const mockKaohsiungData = {
  三民區: {
    九如一路: '001,0,0,0',
  },
  前鎮區: {
    中山路: '001,0,0,0',
  },
}

beforeEach(() => {
  clearCache()

  globalThis.fetch = vi.fn((url: string) => {
    const decodedUrl = decodeURIComponent(url)
    if (decodedUrl.includes('cities.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCitiesData),
      } as Response)
    }
    if (decodedUrl.includes('臺北市.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTaipeiData),
      } as Response)
    }
    if (decodedUrl.includes('高雄市.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockKaohsiungData),
      } as Response)
    }
    return Promise.resolve({
      ok: false,
      status: 404,
    } as Response)
  }) as typeof fetch
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTwZip6 (React Lazy)', () => {
  it('應返回初始載入狀態', () => {
    const { result } = renderHook(() => useTwZip6())

    expect(result.current.loading).toBe(true)
  })

  it('應在載入完成後返回縣市列表', async () => {
    const { result } = renderHook(() => useTwZip6())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.cities).toEqual(['臺北市', '高雄市'])
    expect(result.current.city).toBe('臺北市')
  })

  it('應在切換縣市時載入該縣市資料', async () => {
    const { result } = renderHook(() => useTwZip6())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.setCity('高雄市')
    })

    expect(result.current.city).toBe('高雄市')
    expect(result.current.areas).toContain('三民區')
  })

  it('應能計算 6 碼郵遞區號', async () => {
    const { result } = renderHook(() => useTwZip6())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setArea('中正區')
    })

    act(() => {
      result.current.setRoad('三元街')
    })

    expect(result.current.zipCode).toMatch(/^\d{6}$/)
    expect(result.current.zip3).toBe('100')
  })

  it('應能搜尋路名', async () => {
    const { result } = renderHook(() => useTwZip6())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.searchRoads('三元')
    })

    expect(result.current.searchResults.length).toBeGreaterThan(0)
    expect(result.current.searchResults[0].road).toContain('三元')
  })

  it('應提供快取相關函數', async () => {
    const { result } = renderHook(() => useTwZip6())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.preloadCities).toBe('function')
    expect(typeof result.current.isCityCached).toBe('function')
    expect(typeof result.current.clearCache).toBe('function')
    expect(result.current.isCityCached('臺北市')).toBe(true)
  })
})
