/**
 * 6 碼郵遞區號查詢模組
 * @module @simoko/tw-zip/zip6
 */

import rawData, { type AreaData, type CityAreaData, type CityData, type Zip3Map } from './data'

const zip3Map: Zip3Map = rawData.zip3
const data: CityData = rawData.data

// 6 碼郵遞區號快取（用於加速驗證）
let validZipCodesCache: Set<string> | null = null

// 規則解析快取（避免重複解析相同的規則字串）
const parsedRulesCache = new Map<string, ParsedRule[]>()

// 規則類型: [suffix, even, lane, lane1, alley, alley1, noBgn, noBgn1, noEnd, noEnd1]
type ParsedRule = [string, number, number, number, number, number, number, number, number, number]

// 解析規則字串為陣列（帶快取）
// 格式: "suffix,p1,p2|suffix,p1,p2|..."
function parseRules(rulesStr: string): ParsedRule[] {
  if (!rulesStr)
    return []

  // 檢查快取
  const cached = parsedRulesCache.get(rulesStr)
  if (cached)
    return cached

  const parsed = rulesStr.split('|').map((ruleStr) => {
    const parts = ruleStr.split(',')
    return [
      parts[0], // suffix
      Number(parts[1]) || 0,
      Number(parts[2]) || 0,
      Number(parts[3]) || 0,
      Number(parts[4]) || 0,
      Number(parts[5]) || 0,
      Number(parts[6]) || 0,
      Number(parts[7]) || 0,
      Number(parts[8]) || 0,
      Number(parts[9]) || 0,
    ] as ParsedRule
  })

  // 存入快取
  parsedRulesCache.set(rulesStr, parsed)
  return parsed
}

// 輔助函數：安全取得巢狀資料
function getCityData(city: string): CityAreaData | undefined {
  return data[city]
}

function getAreaData(cityData: CityAreaData, area: string): AreaData | undefined {
  return cityData[area]
}

export interface AddressQuery {
  /** 縣市 */
  city: string
  /** 行政區 */
  area: string
  /** 路名 */
  road: string
  /** 門牌號碼 */
  number?: number
  /** 巷 */
  lane?: number
  /** 弄 */
  alley?: number
}

export interface Zip6Result {
  /** 6 碼郵遞區號 */
  zipcode: string
  /** 3 碼郵遞區號 */
  zip3: string
  /** 縣市 */
  city: string
  /** 行政區 */
  area: string
  /** 路名 */
  road: string
}

/**
 * 取得所有有 6 碼資料的縣市
 */
export function getCities6(): string[] {
  return Object.keys(data)
}

/**
 * 取得指定縣市的所有行政區
 */
export function getAreas6(city: string): string[] {
  const cityData = getCityData(city)
  return cityData ? Object.keys(cityData) : []
}

/**
 * 取得指定行政區的所有路名
 */
export function getRoads6(city: string, area: string): string[] {
  const cityData = getCityData(city)
  if (!cityData)
    return []
  const areaData = getAreaData(cityData, area)
  return areaData ? Object.keys(areaData) : []
}

/**
 * 查詢 6 碼郵遞區號
 * @param query 地址查詢條件
 * @example
 * getZipCode6({ city: '臺北市', area: '中正區', road: '三元街', number: 145 })
 * // { zipcode: '100060', zip3: '100', city: '臺北市', area: '中正區', road: '三元街' }
 */
export function getZipCode6(query: AddressQuery): Zip6Result | undefined {
  const { city, area, road, number, lane, alley } = query

  const cityData = getCityData(city)
  if (!cityData)
    return undefined

  const areaData = getAreaData(cityData, area)
  if (!areaData)
    return undefined

  const roadRulesStr = areaData[road]
  if (!roadRulesStr)
    return undefined

  const zip3 = zip3Map[city]?.[area]
  if (!zip3)
    return undefined

  const rules = parseRules(roadRulesStr)

  // 規則格式: [suffix, even, lane, lane1, alley, alley1, noBgn, noBgn1, noEnd, noEnd1]
  // even: 0=全, 1=單, 2=雙
  for (const rule of rules) {
    const [suffix, even, rLane, rLane1, rAlley, rAlley1, noBgn, _noBgn1, noEnd, _noEnd1] = rule

    // 檢查巷
    if (rLane > 0 || rLane1 > 0) {
      if (!lane)
        continue
      if (rLane > 0 && rLane1 > 0) {
        // 巷範圍
        if (lane < rLane || lane > rLane1)
          continue
      }
      else if (rLane > 0) {
        // 指定巷或巷以上
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
      // 檢查單雙號
      if (even === 1 && number % 2 === 0)
        continue // 要求單號但給了雙號
      if (even === 2 && number % 2 === 1)
        continue // 要求雙號但給了單號

      // 檢查號碼範圍
      const maxNo = noEnd === 9999 || noEnd === 9998 ? Number.POSITIVE_INFINITY : noEnd
      if (noBgn > 0 && number < noBgn)
        continue
      if (maxNo !== Number.POSITIVE_INFINITY && number > maxNo)
        continue
    }
    else if (even !== 0 && number !== undefined) {
      // 只有單雙號限制，沒有號碼範圍
      if (even === 1 && number % 2 === 0)
        continue
      if (even === 2 && number % 2 === 1)
        continue
    }

    // 找到匹配的規則
    return {
      zipcode: zip3 + suffix,
      zip3,
      city,
      area,
      road,
    }
  }

  // 沒有精確匹配，返回第一筆
  if (rules.length > 0) {
    const [suffix] = rules[0]
    return {
      zipcode: zip3 + suffix,
      zip3,
      city,
      area,
      road,
    }
  }

  return undefined
}

/**
 * 取得指定路名的所有 6 碼郵遞區號
 * @example
 * getZipCodes6ByRoad('臺北市', '中正區', '三元街')
 * // ['100053', '100060']
 */
export function getZipCodes6ByRoad(city: string, area: string, road: string): string[] {
  const cityData = getCityData(city)
  if (!cityData)
    return []
  const areaData = getAreaData(cityData, area)
  if (!areaData)
    return []
  const roadRulesStr = areaData[road]
  if (!roadRulesStr)
    return []

  const zip3 = zip3Map[city]?.[area]
  if (!zip3)
    return []

  const rules = parseRules(roadRulesStr)
  const zipcodes = new Set<string>()
  for (const rule of rules) {
    zipcodes.add(zip3 + rule[0])
  }

  return Array.from(zipcodes).sort()
}

/**
 * 搜尋路名
 * @param keyword 關鍵字
 * @param city 限定縣市（可選）
 * @param area 限定行政區（可選）
 * @example
 * searchRoads6('三元')
 * // [{ city: '臺北市', area: '中正區', road: '三元街' }, ...]
 */
export function searchRoads6(keyword: string, city?: string, area?: string): Array<{ city: string, area: string, road: string }> {
  const results: Array<{ city: string, area: string, road: string }> = []
  const trimmed = keyword.trim()
  if (!trimmed)
    return results

  const cities = city ? [city] : Object.keys(data)

  for (const c of cities) {
    const cityData = getCityData(c)
    if (!cityData)
      continue

    const areas = area ? [area] : Object.keys(cityData)

    for (const a of areas) {
      const areaData = getAreaData(cityData, a)
      if (!areaData)
        continue

      for (const road of Object.keys(areaData)) {
        if (road.includes(trimmed)) {
          results.push({ city: c, area: a, road })
        }
      }
    }
  }

  return results
}

/**
 * 建立有效 6 碼郵遞區號快取（懶加載）
 */
function buildValidZipCodesCache(): Set<string> {
  if (validZipCodesCache) {
    return validZipCodesCache
  }

  validZipCodesCache = new Set<string>()

  for (const city of Object.keys(data)) {
    const cityData = getCityData(city)
    if (!cityData)
      continue

    for (const area of Object.keys(cityData)) {
      const zip3 = zip3Map[city]?.[area]
      if (!zip3)
        continue

      const areaData = getAreaData(cityData, area)
      if (!areaData)
        continue

      for (const road of Object.keys(areaData)) {
        const roadRulesStr = areaData[road]
        const rules = parseRules(roadRulesStr)
        for (const rule of rules) {
          validZipCodesCache.add(zip3 + rule[0])
        }
      }
    }
  }

  return validZipCodesCache
}

/**
 * 驗證 6 碼郵遞區號是否有效
 * @description 使用快取優化，首次調用會建立快取，後續調用為 O(1) 查詢
 */
export function isValidZipCode6(zipcode: string): boolean {
  if (!/^\d{6}$/.test(zipcode))
    return false

  const cache = buildValidZipCodesCache()
  return cache.has(zipcode)
}
