import { computed, Injectable, signal } from '@angular/core'
import type { CityAreaData, Zip3Map } from '../zip6/loader'
import {
  clearCache,
  isCityCached,
  loadCitiesData,
  loadCityData,
  preloadCities,
} from '../zip6/loader'

export interface SearchResult {
  city: string
  area: string
  road: string
}

export interface Zip6Result {
  zipcode: string
  zip3: string
  city: string
  area: string
  road: string
}

export interface TwZip6LazyServiceOptions {
  /** 資料來源 URL（預設使用 jsDelivr CDN） */
  baseUrl?: string
  /** 預載入的縣市列表 */
  preload?: string[]
}

// 規則解析快取
const parsedRulesCache = new Map<string, Array<[string, ...number[]]>>()

// 解析規則字串（帶快取）
function parseRules(rulesStr: string): Array<[string, ...number[]]> {
  if (!rulesStr)
    return []

  const cached = parsedRulesCache.get(rulesStr)
  if (cached)
    return cached

  const parsed = rulesStr.split('|').map((rule) => {
    const parts = rule.split(',')
    return [parts[0], ...parts.slice(1).map(Number)] as [string, ...number[]]
  })

  parsedRulesCache.set(rulesStr, parsed)
  return parsed
}

// 計算郵遞區號
function calculateZipCode(
  city: string,
  area: string,
  road: string,
  number: number | undefined,
  lane: number | undefined,
  alley: number | undefined,
  cityData: CityAreaData | undefined,
  zip3Map: Zip3Map,
): Zip6Result | undefined {
  if (!cityData)
    return undefined

  const areaData = cityData[area]
  if (!areaData)
    return undefined

  const rulesStr = areaData[road]
  if (!rulesStr)
    return undefined

  const zip3 = zip3Map[city]?.[area]
  if (!zip3)
    return undefined

  const rules = parseRules(rulesStr)

  for (const rule of rules) {
    const [suffix, even = 0, rLane = 0, rLane1 = 0, rAlley = 0, rAlley1 = 0, noBgn = 0, _noBgn1 = 0, noEnd = 0, _noEnd1 = 0] = rule

    // 檢查巷
    if (rLane > 0 || rLane1 > 0) {
      if (!lane)
        continue
      if (rLane > 0 && rLane1 > 0) {
        if (lane < rLane || lane > rLane1)
          continue
      }
      else if (rLane > 0) {
        if (noEnd === 9999 || noEnd === 9998) {
          if (lane < rLane)
            continue
        }
        else if (lane !== rLane) {
          continue
        }
      }
    }

    // 檢查弄
    if (rAlley > 0 || rAlley1 > 0) {
      if (!alley)
        continue
      if (rAlley > 0 && rAlley1 > 0) {
        if (alley < rAlley || alley > rAlley1)
          continue
      }
      else if (rAlley > 0 && alley !== rAlley) {
        continue
      }
    }

    // 檢查門牌號碼
    if (number !== undefined && (noBgn > 0 || noEnd > 0)) {
      if (even === 1 && number % 2 === 0)
        continue
      if (even === 2 && number % 2 === 1)
        continue

      const maxNo = noEnd === 9999 || noEnd === 9998 ? Number.POSITIVE_INFINITY : noEnd
      if (noBgn > 0 && number < noBgn)
        continue
      if (maxNo !== Number.POSITIVE_INFINITY && number > maxNo)
        continue
    }
    else if (even !== 0 && number !== undefined) {
      if (even === 1 && number % 2 === 0)
        continue
      if (even === 2 && number % 2 === 1)
        continue
    }

    return { zipcode: zip3 + suffix, zip3, city, area, road }
  }

  // 沒有精確匹配，返回第一筆
  if (rules.length > 0) {
    const [suffix] = rules[0]
    return { zipcode: zip3 + suffix, zip3, city, area, road }
  }

  return undefined
}

@Injectable({
  providedIn: 'root',
})
export class TwZip6LazyService {
  private readonly baseUrl = signal<string | undefined>(undefined)
  private readonly zip3Map = signal<Zip3Map>({})
  private readonly cityData = signal<CityAreaData | undefined>(undefined)
  private requestId = 0

  // 狀態
  readonly loading = signal(true)
  readonly cities = signal<string[]>([])

  // 選中值
  readonly city = signal('')
  readonly area = signal('')
  readonly road = signal('')
  readonly number = signal<number | undefined>(undefined)
  readonly lane = signal<number | undefined>(undefined)
  readonly alley = signal<number | undefined>(undefined)

  // 選項列表
  readonly areas = signal<string[]>([])
  readonly roads = signal<string[]>([])
  readonly searchResults = signal<SearchResult[]>([])

  // 計算結果
  readonly result = computed<Zip6Result | undefined>(() => {
    const c = this.city()
    const a = this.area()
    const r = this.road()
    const data = this.cityData()
    if (!c || !a || !r || !data)
      return undefined
    return calculateZipCode(c, a, r, this.number(), this.lane(), this.alley(), data, this.zip3Map())
  })

  readonly zipCode = computed(() => this.result()?.zipcode ?? '')
  readonly zip3 = computed(() => this.result()?.zip3 ?? '')

  /**
   * 初始化服務（必須在使用前呼叫）
   */
  async init(options: TwZip6LazyServiceOptions = {}): Promise<void> {
    this.baseUrl.set(options.baseUrl)
    this.loading.set(true)

    try {
      const data = await loadCitiesData({ baseUrl: options.baseUrl })
      this.cities.set(data.cities)
      this.zip3Map.set(data.zip3)

      const firstCity = data.cities[0] ?? ''
      this.city.set(firstCity)

      // 預載入指定縣市
      if (options.preload && options.preload.length > 0) {
        await preloadCities(options.preload, { baseUrl: options.baseUrl })
      }

      // 載入第一個縣市的資料
      if (firstCity) {
        const firstCityData = await loadCityData(firstCity, { baseUrl: options.baseUrl })
        this.cityData.set(firstCityData)
        const newAreas = Object.keys(firstCityData)
        this.areas.set(newAreas)
        this.area.set(newAreas[0] ?? '')

        if (newAreas[0]) {
          const areaData = firstCityData[newAreas[0]]
          if (areaData) {
            const newRoads = Object.keys(areaData)
            this.roads.set(newRoads)
            this.road.set(newRoads[0] ?? '')
          }
        }
      }
    }
    finally {
      this.loading.set(false)
    }
  }

  /**
   * 設定縣市（會觸發非同步載入）
   */
  async setCity(value: string): Promise<void> {
    const currentRequestId = ++this.requestId
    this.city.set(value)
    this.loading.set(true)

    try {
      const newCityData = await loadCityData(value, { baseUrl: this.baseUrl() })

      // 檢查競態條件
      if (this.requestId !== currentRequestId) {
        return
      }

      this.cityData.set(newCityData)
      const newAreas = Object.keys(newCityData)
      this.areas.set(newAreas)
      this.area.set(newAreas[0] ?? '')
      this.roads.set([])
      this.road.set('')
      this.number.set(undefined)
      this.lane.set(undefined)
      this.alley.set(undefined)

      if (newAreas[0]) {
        const areaData = newCityData[newAreas[0]]
        if (areaData) {
          const newRoads = Object.keys(areaData)
          this.roads.set(newRoads)
          this.road.set(newRoads[0] ?? '')
        }
      }
    }
    catch (error) {
      if (this.requestId === currentRequestId) {
        console.error(`Failed to load city data for ${value}:`, error)
      }
    }
    finally {
      if (this.requestId === currentRequestId) {
        this.loading.set(false)
      }
    }
  }

  /**
   * 設定行政區
   */
  setArea(value: string): void {
    this.area.set(value)
    const data = this.cityData()
    if (data) {
      const areaData = data[value]
      if (areaData) {
        const newRoads = Object.keys(areaData)
        this.roads.set(newRoads)
        this.road.set(newRoads[0] ?? '')
      }
      else {
        this.roads.set([])
        this.road.set('')
      }
    }
    this.number.set(undefined)
    this.lane.set(undefined)
    this.alley.set(undefined)
  }

  /**
   * 設定路名
   */
  setRoad(value: string): void {
    this.road.set(value)
    this.number.set(undefined)
    this.lane.set(undefined)
    this.alley.set(undefined)
  }

  /**
   * 設定門牌號碼
   */
  setNumber(value: number | undefined): void {
    this.number.set(value)
  }

  /**
   * 設定巷
   */
  setLane(value: number | undefined): void {
    this.lane.set(value)
  }

  /**
   * 設定弄
   */
  setAlley(value: number | undefined): void {
    this.alley.set(value)
  }

  /**
   * 搜尋路名（在目前縣市中搜尋）
   */
  searchRoads(keyword: string): void {
    if (!keyword.trim()) {
      this.searchResults.set([])
      return
    }

    const results: SearchResult[] = []
    const trimmed = keyword.trim()
    const data = this.cityData()
    const currentCity = this.city()

    if (data) {
      for (const [a, areaData] of Object.entries(data)) {
        for (const r of Object.keys(areaData)) {
          if (r.includes(trimmed)) {
            results.push({ city: currentCity, area: a, road: r })
          }
        }
      }
    }

    this.searchResults.set(results)
  }

  /**
   * 預載入縣市資料
   */
  async preloadCities(citiesToPreload: string[]): Promise<void> {
    await preloadCities(citiesToPreload, { baseUrl: this.baseUrl() })
  }

  /**
   * 檢查縣市是否已快取
   */
  isCityCached(city: string): boolean {
    return isCityCached(city)
  }

  /**
   * 清除快取
   */
  clearCache(): void {
    clearCache()
  }
}

// Re-export loader utilities for convenience
export { clearCache, isCityCached, preloadCities } from '../zip6/loader'
