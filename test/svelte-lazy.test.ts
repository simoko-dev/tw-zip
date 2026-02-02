import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTwZip6 } from '../src/svelte/lazy'
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

// 等待異步操作的輔助函數
function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const check = () => {
      if (condition()) {
        resolve()
      }
      else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'))
      }
      else {
        setTimeout(check, 10)
      }
    }
    check()
  })
}

describe('createTwZip6 (Svelte Lazy)', () => {
  it('應返回初始載入狀態', async () => {
    const { loading } = createTwZip6()

    // 初始狀態為載入中
    expect(get(loading)).toBe(true)

    // 等待載入完成
    await waitFor(() => get(loading) === false)
    expect(get(loading)).toBe(false)
  })

  it('應在載入完成後返回縣市列表', async () => {
    const { loading, cities, city } = createTwZip6()

    await waitFor(() => get(loading) === false)

    expect(get(cities)).toEqual(['臺北市', '高雄市'])
    expect(get(city)).toBe('臺北市')
  })

  it('應在切換縣市時載入該縣市資料', async () => {
    const { loading, setCity, city, areas } = createTwZip6()

    await waitFor(() => get(loading) === false)

    await setCity('高雄市')
    await waitFor(() => get(loading) === false)

    expect(get(city)).toBe('高雄市')
    expect(get(areas)).toContain('三民區')
  })

  it('應能計算 6 碼郵遞區號', async () => {
    const { loading, setArea, setRoad, zipCode, zip3 } = createTwZip6()

    await waitFor(() => get(loading) === false)

    setArea('中正區')
    setRoad('三元街')

    expect(get(zipCode)).toMatch(/^\d{6}$/)
    expect(get(zip3)).toBe('100')
  })

  it('應能搜尋路名', async () => {
    const { loading, searchRoads, searchResults } = createTwZip6()

    await waitFor(() => get(loading) === false)

    searchRoads('三元')

    expect(get(searchResults).length).toBeGreaterThan(0)
    expect(get(searchResults)[0].road).toContain('三元')
  })

  it('應提供快取相關函數', async () => {
    const { loading, preloadCities, isCityCached, clearCache } = createTwZip6()

    await waitFor(() => get(loading) === false)

    expect(typeof preloadCities).toBe('function')
    expect(typeof isCityCached).toBe('function')
    expect(typeof clearCache).toBe('function')
    expect(isCityCached('臺北市')).toBe(true)
  })
})
