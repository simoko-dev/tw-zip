import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('useTwZip6 (Vue Lazy)', () => {
  it('應正確匯出 loader 函數', async () => {
    const { loadCitiesData, loadCityData } = await import('../src/zip6/loader')

    const citiesData = await loadCitiesData()
    expect(citiesData.cities).toEqual(['臺北市', '高雄市'])

    const taipeiData = await loadCityData('臺北市')
    expect(taipeiData).toHaveProperty('中正區')
  })

  it('loader 應能快取縣市資料', async () => {
    const { loadCityData, isCityCached } = await import('../src/zip6/loader')

    expect(isCityCached('臺北市')).toBe(false)
    await loadCityData('臺北市')
    expect(isCityCached('臺北市')).toBe(true)
  })

  it('loader 應能預載入多個縣市', async () => {
    const { preloadCities, isCityCached } = await import('../src/zip6/loader')

    expect(isCityCached('臺北市')).toBe(false)
    expect(isCityCached('高雄市')).toBe(false)

    await preloadCities(['臺北市', '高雄市'])

    expect(isCityCached('臺北市')).toBe(true)
    expect(isCityCached('高雄市')).toBe(true)
  })

  it('useTwZip6 應匯出正確的型別', async () => {
    // 因為 Vue composable 需要在 setup 中使用，這裡只測試型別匯出
    const { useTwZip6 } = await import('../src/vue/lazy')
    expect(typeof useTwZip6).toBe('function')
  })

  it('clearCache 應清除所有快取', async () => {
    const { loadCityData, isCityCached, clearCache: clear } = await import('../src/zip6/loader')

    await loadCityData('臺北市')
    expect(isCityCached('臺北市')).toBe(true)

    clear()
    expect(isCityCached('臺北市')).toBe(false)
  })
})
