import type { CityAreaData, Zip3Map } from '../zip6/loader'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

export function useTwZip6(options: UseTwZip6Options = {}) {
  const { baseUrl, preload } = options

  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<string[]>([])
  const [zip3Map, setZip3Map] = useState<Zip3Map>({})

  const [city, setCityState] = useState<string>('')
  const [area, setAreaState] = useState<string>('')
  const [road, setRoadState] = useState<string>('')
  const [number, setNumber] = useState<number | undefined>(undefined)
  const [lane, setLane] = useState<number | undefined>(undefined)
  const [alley, setAlley] = useState<number | undefined>(undefined)

  const [areas, setAreas] = useState<string[]>([])
  const [roads, setRoads] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [cityData, setCityData] = useState<CityAreaData | undefined>(undefined)

  // 用於追蹤最新請求，處理競態條件
  const requestIdRef = useRef(0)

  // 初始化：載入縣市列表
  useEffect(() => {
    let mounted = true

    async function init() {
      setLoading(true)
      const data = await loadCitiesData({ baseUrl })

      if (!mounted)
        return

      setCities(data.cities)
      setZip3Map(data.zip3)

      const firstCity = data.cities[0] ?? ''
      setCityState(firstCity)

      // 預載入指定縣市
      if (preload && preload.length > 0) {
        await preloadCities(preload, { baseUrl })
      }

      // 載入第一個縣市的資料
      if (firstCity) {
        const firstCityData = await loadCityData(firstCity, { baseUrl })
        if (!mounted)
          return

        setCityData(firstCityData)
        const newAreas = Object.keys(firstCityData)
        setAreas(newAreas)
        setAreaState(newAreas[0] ?? '')

        if (newAreas[0]) {
          const areaData = firstCityData[newAreas[0]]
          if (areaData) {
            const newRoads = Object.keys(areaData)
            setRoads(newRoads)
            setRoadState(newRoads[0] ?? '')
          }
        }
      }

      setLoading(false)
    }

    init()

    return () => {
      mounted = false
    }
  }, [baseUrl])

  // 切換縣市（使用 requestId 處理競態條件）
  const setCity = useCallback(async (value: string) => {
    const currentRequestId = ++requestIdRef.current
    setCityState(value)
    setLoading(true)

    try {
      const newCityData = await loadCityData(value, { baseUrl })

      // 檢查競態條件：如果已有新的請求，忽略此結果
      if (requestIdRef.current !== currentRequestId) {
        return
      }

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
        const areaData = newCityData[newAreas[0]]
        if (areaData) {
          const newRoads = Object.keys(areaData)
          setRoads(newRoads)
          setRoadState(newRoads[0] ?? '')
        }
      }
    }
    catch (error) {
      // 只有當前請求才報錯
      if (requestIdRef.current === currentRequestId) {
        console.error(`Failed to load city data for ${value}:`, error)
      }
    }
    finally {
      // 只有當前請求才更新 loading 狀態
      if (requestIdRef.current === currentRequestId) {
        setLoading(false)
      }
    }
  }, [baseUrl])

  // 切換行政區
  const setArea = useCallback((value: string) => {
    setAreaState(value)
    if (cityData) {
      const areaData = cityData[value]
      if (areaData) {
        const newRoads = Object.keys(areaData)
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
  }, [cityData])

  // 切換路名
  const setRoad = useCallback((value: string) => {
    setRoadState(value)
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }, [])

  // 路名搜尋（在已載入的縣市中搜尋）
  const searchRoads = useCallback((keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }

    const results: SearchResult[] = []
    const trimmed = keyword.trim()

    // 搜尋目前縣市
    if (cityData) {
      for (const [a, areaData] of Object.entries(cityData)) {
        for (const r of Object.keys(areaData)) {
          if (r.includes(trimmed)) {
            results.push({ city, area: a, road: r })
          }
        }
      }
    }

    setSearchResults(results)
  }, [city, cityData])

  // 計算郵遞區號
  const result = useMemo<Zip6Result | undefined>(() => {
    if (!city || !area || !road || !cityData)
      return undefined
    return calculateZipCode(city, area, road, number, lane, alley, cityData, zip3Map)
  }, [city, area, road, number, lane, alley, cityData, zip3Map])

  const zipCode = result?.zipcode ?? ''
  const zip3 = result?.zip3 ?? ''

  return {
    // 載入狀態
    loading,

    // 選項列表
    cities,
    areas,
    roads,

    // 選中值
    city,
    area,
    road,
    number,
    lane,
    alley,

    // Setters
    setCity,
    setArea,
    setRoad,
    setNumber,
    setLane,
    setAlley,

    // 路名搜尋
    searchRoads,
    searchResults,

    // 結果
    zipCode,
    zip3,
    result,

    // 工具函數
    preloadCities: useCallback(
      (citiesToPreload: string[]) => preloadCities(citiesToPreload, { baseUrl }),
      [baseUrl]
    ),
    isCityCached,
    clearCache,
  }
}
