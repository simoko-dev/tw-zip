import type { CityAreaData, Zip3Map } from '../zip6/loader'
import { createMemo, createSignal } from 'solid-js'
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

export interface UseTwZip6Options {
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

export function useTwZip6(options: UseTwZip6Options = {}) {
  const { baseUrl, preload } = options

  const [loading, setLoading] = createSignal(true)
  const [cities, setCities] = createSignal<string[]>([])
  const [zip3Map, setZip3Map] = createSignal<Zip3Map>({})

  const [city, setCityState] = createSignal('')
  const [area, setAreaState] = createSignal('')
  const [road, setRoadState] = createSignal('')
  const [number, setNumber] = createSignal<number | undefined>(undefined)
  const [lane, setLane] = createSignal<number | undefined>(undefined)
  const [alley, setAlley] = createSignal<number | undefined>(undefined)

  const [areas, setAreas] = createSignal<string[]>([])
  const [roads, setRoads] = createSignal<string[]>([])
  const [searchResults, setSearchResults] = createSignal<SearchResult[]>([])
  const [cityData, setCityData] = createSignal<CityAreaData | undefined>(undefined)

  // 用於追蹤最新請求
  let requestId = 0

  // 初始化
  async function init() {
    setLoading(true)
    const data = await loadCitiesData({ baseUrl })

    setCities(data.cities)
    setZip3Map(data.zip3)

    const firstCity = data.cities[0] ?? ''
    setCityState(firstCity)

    if (preload && preload.length > 0) {
      await preloadCities(preload, { baseUrl })
    }

    if (firstCity) {
      const firstCityData = await loadCityData(firstCity, { baseUrl })
      setCityData(firstCityData)
      const newAreas = Object.keys(firstCityData)
      setAreas(newAreas)
      setAreaState(newAreas[0] ?? '')

      if (newAreas[0]) {
        const areaDataObj = firstCityData[newAreas[0]]
        if (areaDataObj) {
          const newRoads = Object.keys(areaDataObj)
          setRoads(newRoads)
          setRoadState(newRoads[0] ?? '')
        }
      }
    }

    setLoading(false)
  }

  // 啟動初始化
  init()

  // 切換縣市
  async function setCity(value: string) {
    const currentRequestId = ++requestId
    setCityState(value)
    setLoading(true)

    try {
      const newCityData = await loadCityData(value, { baseUrl })

      if (requestId !== currentRequestId) return

      setCityData(newCityData)
      const newAreas = Object.keys(newCityData)
      setAreas(newAreas)
      setAreaState(newAreas[0] ?? '')
      setRoads([])
      setRoadState('')
      setNumber(undefined)
      setLane(undefined)
      setAlley(undefined)

      if (newAreas[0]) {
        const areaDataObj = newCityData[newAreas[0]]
        if (areaDataObj) {
          const newRoads = Object.keys(areaDataObj)
          setRoads(newRoads)
          setRoadState(newRoads[0] ?? '')
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
        setLoading(false)
      }
    }
  }

  // 切換行政區
  function setArea(value: string) {
    setAreaState(value)
    const currentCityData = cityData()
    if (currentCityData) {
      const areaDataObj = currentCityData[value]
      if (areaDataObj) {
        const newRoads = Object.keys(areaDataObj)
        setRoads(newRoads)
        setRoadState(newRoads[0] ?? '')
      }
      else {
        setRoads([])
        setRoadState('')
      }
    }
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }

  // 切換路名
  function setRoad(value: string) {
    setRoadState(value)
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }

  // 路名搜尋
  function searchRoads(keyword: string) {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }

    const results: SearchResult[] = []
    const trimmed = keyword.trim()
    const currentCity = city()
    const currentCityData = cityData()

    if (currentCityData) {
      for (const [a, areaDataObj] of Object.entries(currentCityData)) {
        for (const r of Object.keys(areaDataObj)) {
          if (r.includes(trimmed)) {
            results.push({ city: currentCity, area: a, road: r })
          }
        }
      }
    }

    setSearchResults(results)
  }

  // 計算郵遞區號
  const result = createMemo<Zip6Result | undefined>(() => {
    if (!city() || !area() || !road() || !cityData()) return undefined
    return calculateZipCode(city(), area(), road(), number(), lane(), alley(), cityData(), zip3Map())
  })

  const zipCode = createMemo(() => result()?.zipcode ?? '')
  const zip3 = createMemo(() => result()?.zip3 ?? '')

  return {
    loading,
    cities,
    areas,
    roads,

    city,
    area,
    road,
    number,
    lane,
    alley,

    setCity,
    setArea,
    setRoad,
    setNumber,
    setLane,
    setAlley,

    searchRoads,
    searchResults,

    zipCode,
    zip3,
    result,

    preloadCities: (citiesToPreload: string[]) => preloadCities(citiesToPreload, { baseUrl }),
    isCityCached,
    clearCache,
  }
}

export { clearCache, isCityCached } from '../zip6/loader'
export default useTwZip6
