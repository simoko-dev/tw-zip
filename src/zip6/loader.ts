/**
 * 動態載入 zip6 資料
 */

export type AreaData = Record<string, string>
export type CityAreaData = Record<string, AreaData>
export type Zip3Map = Record<string, Record<string, string>>

export interface CitiesData {
  cities: string[]
  zip3: Zip3Map
}

// 預設使用 jsDelivr CDN
const DEFAULT_BASE_URL = 'https://cdn.jsdelivr.net/npm/@simoko/tw-zip/data/zip6'

// 快取
const cityDataCache = new Map<string, CityAreaData>()
let citiesData: CitiesData | null = null
let citiesDataPromise: Promise<CitiesData> | null = null

export interface LoaderOptions {
  baseUrl?: string
}

/**
 * 載入縣市列表和 zip3 對照表
 */
export async function loadCitiesData(options: LoaderOptions = {}): Promise<CitiesData> {
  if (citiesData) {
    return citiesData
  }

  if (citiesDataPromise) {
    return citiesDataPromise
  }

  const baseUrl = options.baseUrl || DEFAULT_BASE_URL

  citiesDataPromise = fetch(`${baseUrl}/cities.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load cities data: HTTP ${res.status}`)
      }
      return res.json()
    })
    .then((data: CitiesData) => {
      citiesData = data
      return data
    })
    .catch((error) => {
      // 清除 promise 以允許重試
      citiesDataPromise = null
      throw error
    })

  return citiesDataPromise
}

/**
 * 載入指定縣市的資料
 */
export async function loadCityData(city: string, options: LoaderOptions = {}): Promise<CityAreaData> {
  const trimmedCity = city.trim()
  if (!trimmedCity) {
    throw new Error('City name cannot be empty')
  }

  const cached = cityDataCache.get(trimmedCity)
  if (cached) {
    return cached
  }

  const baseUrl = options.baseUrl || DEFAULT_BASE_URL

  const response = await fetch(`${baseUrl}/${encodeURIComponent(trimmedCity)}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load city data for ${trimmedCity}: HTTP ${response.status}`)
  }

  const data = await response.json() as CityAreaData

  cityDataCache.set(trimmedCity, data)
  return data
}

/**
 * 預載入指定縣市
 */
export async function preloadCities(cities: string[], options: LoaderOptions = {}): Promise<void> {
  await Promise.all(cities.map(city => loadCityData(city, options)))
}

/**
 * 取得已快取的縣市資料（同步）
 */
export function getCachedCityData(city: string): CityAreaData | undefined {
  return cityDataCache.get(city)
}

/**
 * 檢查縣市資料是否已快取
 */
export function isCityCached(city: string): boolean {
  return cityDataCache.has(city)
}

/**
 * 清除快取
 */
export function clearCache(): void {
  cityDataCache.clear()
  citiesData = null
  citiesDataPromise = null
}
