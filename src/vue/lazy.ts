import type { CityAreaData, Zip3Map } from '../zip6/loader'
import { computed, onMounted, ref } from 'vue'
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

  const loading = ref(true)
  const cities = ref<string[]>([])
  const zip3Map = ref<Zip3Map>({})

  const city = ref('')
  const area = ref('')
  const road = ref('')
  const number = ref<number | undefined>(undefined)
  const lane = ref<number | undefined>(undefined)
  const alley = ref<number | undefined>(undefined)

  const areas = ref<string[]>([])
  const roads = ref<string[]>([])
  const searchResults = ref<SearchResult[]>([])
  const cityData = ref<CityAreaData | undefined>(undefined)

  // 切換縣市（包含錯誤處理和競態條件防護）
  async function setCity(value: string) {
    const requestedCity = value
    city.value = value
    loading.value = true

    try {
      const newCityData = await loadCityData(value, { baseUrl })

      // 檢查競態條件：如果用戶已切換到其他縣市，忽略此結果
      if (city.value !== requestedCity) {
        return
      }

      cityData.value = newCityData

      const newAreas = Object.keys(newCityData)
      areas.value = newAreas
      area.value = newAreas[0] ?? ''
      roads.value = []
      road.value = ''
      number.value = undefined
      lane.value = undefined
      alley.value = undefined

      if (newAreas[0]) {
        const areaDataObj = newCityData[newAreas[0]]
        if (areaDataObj) {
          const newRoads = Object.keys(areaDataObj)
          roads.value = newRoads
          road.value = newRoads[0] ?? ''
        }
      }
    }
    catch (error) {
      console.error(`Failed to load city data for ${value}:`, error)
    }
    finally {
      loading.value = false
    }
  }

  // 切換行政區
  function setArea(value: string) {
    area.value = value
    if (cityData.value) {
      const areaDataObj = cityData.value[value]
      if (areaDataObj) {
        const newRoads = Object.keys(areaDataObj)
        roads.value = newRoads
        road.value = newRoads[0] ?? ''
      }
      else {
        roads.value = []
        road.value = ''
      }
    }
    number.value = undefined
    lane.value = undefined
    alley.value = undefined
  }

  // 切換路名
  function setRoad(value: string) {
    road.value = value
    number.value = undefined
    lane.value = undefined
    alley.value = undefined
  }

  // 路名搜尋
  function searchRoads(keyword: string) {
    if (!keyword.trim()) {
      searchResults.value = []
      return
    }

    const results: SearchResult[] = []
    const trimmed = keyword.trim()

    if (cityData.value) {
      for (const [a, areaDataObj] of Object.entries(cityData.value)) {
        for (const r of Object.keys(areaDataObj)) {
          if (r.includes(trimmed)) {
            results.push({ city: city.value, area: a, road: r })
          }
        }
      }
    }

    searchResults.value = results
  }

  // 計算郵遞區號
  const result = computed<Zip6Result | undefined>(() => {
    if (!city.value || !area.value || !road.value || !cityData.value)
      return undefined
    return calculateZipCode(
      city.value,
      area.value,
      road.value,
      number.value,
      lane.value,
      alley.value,
      cityData.value,
      zip3Map.value,
    )
  })

  const zipCode = computed(() => result.value?.zipcode ?? '')
  const zip3 = computed(() => result.value?.zip3 ?? '')

  // 初始化（包含錯誤處理）
  onMounted(async () => {
    loading.value = true

    try {
      const data = await loadCitiesData({ baseUrl })

      cities.value = data.cities
      zip3Map.value = data.zip3

      const firstCity = data.cities[0] ?? ''
      city.value = firstCity

      // 預載入指定縣市
      if (preload && preload.length > 0) {
        await preloadCities(preload, { baseUrl })
      }

      // 載入第一個縣市的資料
      if (firstCity) {
        const firstCityData = await loadCityData(firstCity, { baseUrl })
        cityData.value = firstCityData
        const newAreas = Object.keys(firstCityData)
        areas.value = newAreas
        area.value = newAreas[0] ?? ''

        if (newAreas[0]) {
          const areaDataObj = firstCityData[newAreas[0]]
          if (areaDataObj) {
            const newRoads = Object.keys(areaDataObj)
            roads.value = newRoads
            road.value = newRoads[0] ?? ''
          }
        }
      }
    }
    catch (error) {
      console.error('Failed to initialize tw-zip data:', error)
    }
    finally {
      loading.value = false
    }
  })

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

    // 路名搜尋
    searchRoads,
    searchResults,

    // 結果
    zipCode,
    zip3,
    result,

    // 工具函數
    preloadCities: (citiesToPreload: string[]) => preloadCities(citiesToPreload, { baseUrl }),
    isCityCached,
    clearCache,
  }
}
