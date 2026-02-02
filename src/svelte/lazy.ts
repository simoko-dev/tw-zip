import type { CityAreaData, Zip3Map } from '../zip6/loader'
import { derived, writable } from 'svelte/store'
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

export interface CreateTwZip6Options {
  baseUrl?: string
  preload?: string[]
}

// 規則解析快取
const parsedRulesCache = new Map<string, Array<[string, ...number[]]>>()

function parseRules(rulesStr: string): Array<[string, ...number[]]> {
  if (!rulesStr) return []

  const cached = parsedRulesCache.get(rulesStr)
  if (cached) return cached

  const parsed = rulesStr.split('|').map((rule) => {
    const parts = rule.split(',')
    return [parts[0], ...parts.slice(1).map(Number)] as [string, ...number[]]
  })

  parsedRulesCache.set(rulesStr, parsed)
  return parsed
}

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
  if (!cityData) return undefined

  const areaData = cityData[area]
  if (!areaData) return undefined

  const rulesStr = areaData[road]
  if (!rulesStr) return undefined

  const zip3 = zip3Map[city]?.[area]
  if (!zip3) return undefined

  const rules = parseRules(rulesStr)

  for (const rule of rules) {
    const [suffix, even = 0, rLane = 0, rLane1 = 0, rAlley = 0, rAlley1 = 0, noBgn = 0, _noBgn1 = 0, noEnd = 0] = rule

    if (rLane > 0 || rLane1 > 0) {
      if (!lane) continue
      if (rLane > 0 && rLane1 > 0) {
        if (lane < rLane || lane > rLane1) continue
      }
      else if (rLane > 0) {
        if (noEnd === 9999 || noEnd === 9998) {
          if (lane < rLane) continue
        }
        else if (lane !== rLane) {
          continue
        }
      }
    }

    if (rAlley > 0 || rAlley1 > 0) {
      if (!alley) continue
      if (rAlley > 0 && rAlley1 > 0) {
        if (alley < rAlley || alley > rAlley1) continue
      }
      else if (rAlley > 0 && alley !== rAlley) {
        continue
      }
    }

    if (number !== undefined && (noBgn > 0 || noEnd > 0)) {
      if (even === 1 && number % 2 === 0) continue
      if (even === 2 && number % 2 === 1) continue

      const maxNo = noEnd === 9999 || noEnd === 9998 ? Number.POSITIVE_INFINITY : noEnd
      if (noBgn > 0 && number < noBgn) continue
      if (maxNo !== Number.POSITIVE_INFINITY && number > maxNo) continue
    }
    else if (even !== 0 && number !== undefined) {
      if (even === 1 && number % 2 === 0) continue
      if (even === 2 && number % 2 === 1) continue
    }

    return { zipcode: zip3 + suffix, zip3, city, area, road }
  }

  if (rules.length > 0) {
    const [suffix] = rules[0]
    return { zipcode: zip3 + suffix, zip3, city, area, road }
  }

  return undefined
}

export function createTwZip6(options: CreateTwZip6Options = {}) {
  const { baseUrl, preload } = options

  const loading = writable(true)
  const cities = writable<string[]>([])
  const zip3MapStore = writable<Zip3Map>({})

  const city = writable('')
  const area = writable('')
  const road = writable('')
  const number = writable<number | undefined>(undefined)
  const lane = writable<number | undefined>(undefined)
  const alley = writable<number | undefined>(undefined)

  const areas = writable<string[]>([])
  const roads = writable<string[]>([])
  const searchResults = writable<SearchResult[]>([])
  const cityData = writable<CityAreaData | undefined>(undefined)

  // 用於追蹤最新請求
  let requestId = 0

  // 輔助函數
  function getValue<T>(store: { subscribe: (fn: (v: T) => void) => () => void }): T {
    let value: T
    store.subscribe(v => value = v)()
    return value!
  }

  // 初始化
  async function init() {
    loading.set(true)
    const data = await loadCitiesData({ baseUrl })

    cities.set(data.cities)
    zip3MapStore.set(data.zip3)

    const firstCity = data.cities[0] ?? ''
    city.set(firstCity)

    if (preload && preload.length > 0) {
      await preloadCities(preload, { baseUrl })
    }

    if (firstCity) {
      const firstCityData = await loadCityData(firstCity, { baseUrl })
      cityData.set(firstCityData)
      const newAreas = Object.keys(firstCityData)
      areas.set(newAreas)
      area.set(newAreas[0] ?? '')

      if (newAreas[0]) {
        const areaDataObj = firstCityData[newAreas[0]]
        if (areaDataObj) {
          const newRoads = Object.keys(areaDataObj)
          roads.set(newRoads)
          road.set(newRoads[0] ?? '')
        }
      }
    }

    loading.set(false)
  }

  // 啟動初始化
  init()

  // 切換縣市
  async function setCity(value: string) {
    const currentRequestId = ++requestId
    city.set(value)
    loading.set(true)

    try {
      const newCityData = await loadCityData(value, { baseUrl })

      if (requestId !== currentRequestId) return

      cityData.set(newCityData)
      const newAreas = Object.keys(newCityData)
      areas.set(newAreas)
      area.set(newAreas[0] ?? '')
      roads.set([])
      road.set('')
      number.set(undefined)
      lane.set(undefined)
      alley.set(undefined)

      if (newAreas[0]) {
        const areaDataObj = newCityData[newAreas[0]]
        if (areaDataObj) {
          const newRoads = Object.keys(areaDataObj)
          roads.set(newRoads)
          road.set(newRoads[0] ?? '')
        }
      }
    }
    catch (error) {
      if (requestId === currentRequestId) {
        console.error(`Failed to load city data for ${value}:`, error)
      }
    }
    finally {
      if (requestId === currentRequestId) {
        loading.set(false)
      }
    }
  }

  // 切換行政區
  function setArea(value: string) {
    area.set(value)
    const currentCityData = getValue(cityData)
    if (currentCityData) {
      const areaDataObj = currentCityData[value]
      if (areaDataObj) {
        const newRoads = Object.keys(areaDataObj)
        roads.set(newRoads)
        road.set(newRoads[0] ?? '')
      }
      else {
        roads.set([])
        road.set('')
      }
    }
    number.set(undefined)
    lane.set(undefined)
    alley.set(undefined)
  }

  // 切換路名
  function setRoad(value: string) {
    road.set(value)
    number.set(undefined)
    lane.set(undefined)
    alley.set(undefined)
  }

  function setNumber(value: number | undefined) {
    number.set(value)
  }

  function setLane(value: number | undefined) {
    lane.set(value)
  }

  function setAlley(value: number | undefined) {
    alley.set(value)
  }

  // 路名搜尋
  function searchRoads(keyword: string) {
    if (!keyword.trim()) {
      searchResults.set([])
      return
    }

    const results: SearchResult[] = []
    const trimmed = keyword.trim()
    const currentCity = getValue(city)
    const currentCityData = getValue(cityData)

    if (currentCityData) {
      for (const [a, areaDataObj] of Object.entries(currentCityData)) {
        for (const r of Object.keys(areaDataObj)) {
          if (r.includes(trimmed)) {
            results.push({ city: currentCity, area: a, road: r })
          }
        }
      }
    }

    searchResults.set(results)
  }

  // 計算郵遞區號
  const result = derived(
    [city, area, road, number, lane, alley, cityData, zip3MapStore],
    ([$city, $area, $road, $number, $lane, $alley, $cityData, $zip3Map]): Zip6Result | undefined => {
      if (!$city || !$area || !$road || !$cityData) return undefined
      return calculateZipCode($city, $area, $road, $number, $lane, $alley, $cityData, $zip3Map)
    }
  )

  const zipCode = derived(result, $r => $r?.zipcode ?? '')
  const zip3 = derived(result, $r => $r?.zip3 ?? '')

  return {
    loading: { subscribe: loading.subscribe },
    cities: { subscribe: cities.subscribe },
    areas: { subscribe: areas.subscribe },
    roads: { subscribe: roads.subscribe },

    city: { subscribe: city.subscribe },
    area: { subscribe: area.subscribe },
    road: { subscribe: road.subscribe },
    number: { subscribe: number.subscribe },
    lane: { subscribe: lane.subscribe },
    alley: { subscribe: alley.subscribe },

    setCity,
    setArea,
    setRoad,
    setNumber,
    setLane,
    setAlley,

    searchRoads,
    searchResults: { subscribe: searchResults.subscribe },

    zipCode,
    zip3,
    result,

    preloadCities: (citiesToPreload: string[]) => preloadCities(citiesToPreload, { baseUrl }),
    isCityCached,
    clearCache,
  }
}

export { clearCache, isCityCached } from '../zip6/loader'
export default createTwZip6
