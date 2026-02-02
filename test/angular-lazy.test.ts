import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TwZip6LazyService } from '../src/angular/lazy'
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

describe('TwZip6LazyService (Angular Lazy)', () => {
  it('應返回初始載入狀態', () => {
    const service = new TwZip6LazyService()

    // 檢查初始狀態為載入中
    expect(service.loading()).toBe(true)
    expect(service.cities()).toEqual([])
  })

  it('應在 init 完成後返回縣市列表', async () => {
    const service = new TwZip6LazyService()

    await service.init()

    expect(service.loading()).toBe(false)
    expect(service.cities()).toEqual(['臺北市', '高雄市'])
    expect(service.city()).toBe('臺北市')
  })

  it('應在切換縣市時載入該縣市資料', async () => {
    const service = new TwZip6LazyService()

    await service.init()
    await service.setCity('高雄市')

    expect(service.city()).toBe('高雄市')
    expect(service.areas()).toContain('三民區')
  })

  it('應能計算 6 碼郵遞區號', async () => {
    const service = new TwZip6LazyService()

    await service.init()

    service.setArea('中正區')
    service.setRoad('三元街')

    expect(service.zipCode()).toMatch(/^\d{6}$/)
    expect(service.zip3()).toBe('100')
  })

  it('應能搜尋路名', async () => {
    const service = new TwZip6LazyService()

    await service.init()

    service.searchRoads('三元')

    expect(service.searchResults().length).toBeGreaterThan(0)
    expect(service.searchResults()[0].road).toContain('三元')
  })

  it('應提供快取相關函數', async () => {
    const service = new TwZip6LazyService()

    await service.init()

    expect(typeof service.preloadCities).toBe('function')
    expect(typeof service.isCityCached).toBe('function')
    expect(typeof service.clearCache).toBe('function')
    expect(service.isCityCached('臺北市')).toBe(true)
  })

  it('應能設定門牌號碼', async () => {
    const service = new TwZip6LazyService()

    await service.init()
    service.setArea('中正區')
    service.setRoad('三元街')
    service.setNumber(150)

    expect(service.number()).toBe(150)
    expect(service.zipCode()).toMatch(/^\d{6}$/)
  })

  it('應能處理選項參數', async () => {
    const service = new TwZip6LazyService()

    await service.init({
      baseUrl: 'https://custom-cdn.com/data',
    })

    expect(service.loading()).toBe(false)
  })
})
