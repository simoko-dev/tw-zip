import type { Zip6Result } from '../zip6'
import { derived, readable, writable } from 'svelte/store'
import { getAreas6, getCities6, getRoads6, getZipCode6, searchRoads6 } from '../zip6'

export interface SearchResult {
  city: string
  area: string
  road: string
}

export function createTwZip6() {
  const initialCities = getCities6()
  const initialCity = initialCities[0] ?? ''
  const initialAreas = initialCity ? getAreas6(initialCity) : []
  const initialArea = initialAreas[0] ?? ''
  const initialRoads = initialCity && initialArea ? getRoads6(initialCity, initialArea) : []
  const initialRoad = initialRoads[0] ?? ''

  const cities = readable(initialCities)

  const city = writable(initialCity)
  const area = writable(initialArea)
  const road = writable(initialRoad)
  const number = writable<number | undefined>(undefined)
  const lane = writable<number | undefined>(undefined)
  const alley = writable<number | undefined>(undefined)

  const areas = writable(initialAreas)
  const roads = writable(initialRoads)
  const searchResults = writable<SearchResult[]>([])

  // 當縣市改變時，更新行政區列表並重置
  city.subscribe(($city) => {
    if (!$city) return
    const newAreas = getAreas6($city)
    areas.set(newAreas)
    const firstArea = newAreas[0] ?? ''
    area.set(firstArea)

    // 更新路名
    if (firstArea) {
      const newRoads = getRoads6($city, firstArea)
      roads.set(newRoads)
      road.set(newRoads[0] ?? '')
    }
    else {
      roads.set([])
      road.set('')
    }

    // 重置門牌相關
    number.set(undefined)
    lane.set(undefined)
    alley.set(undefined)
  })

  // 輔助函數：取得當前 city 值
  function getCurrentCity(): string {
    let currentCity = ''
    city.subscribe(v => currentCity = v)()
    return currentCity
  }

  // 輔助函數：取得當前 area 值
  function getCurrentArea(): string {
    let currentArea = ''
    area.subscribe(v => currentArea = v)()
    return currentArea
  }

  // 設定縣市
  function setCity(value: string) {
    city.set(value)
  }

  // 設定行政區
  function setArea(value: string) {
    const $city = getCurrentCity()
    area.set(value)
    const newRoads = getRoads6($city, value)
    roads.set(newRoads)
    road.set(newRoads[0] ?? '')
    number.set(undefined)
    lane.set(undefined)
    alley.set(undefined)
  }

  // 設定路名
  function setRoad(value: string) {
    road.set(value)
    number.set(undefined)
    lane.set(undefined)
    alley.set(undefined)
  }

  // 設定門牌號碼
  function setNumber(value: number | undefined) {
    number.set(value)
  }

  // 設定巷
  function setLane(value: number | undefined) {
    lane.set(value)
  }

  // 設定弄
  function setAlley(value: number | undefined) {
    alley.set(value)
  }

  // 路名搜尋
  function searchRoads(keyword: string) {
    if (!keyword.trim()) {
      searchResults.set([])
      return
    }
    const $city = getCurrentCity()
    const $area = getCurrentArea()
    const results = searchRoads6(keyword, $city || undefined, $area || undefined)
    searchResults.set(results)
  }

  // 計算郵遞區號結果
  const result = derived(
    [city, area, road, number, lane, alley],
    ([$city, $area, $road, $number, $lane, $alley]): Zip6Result | undefined => {
      if (!$city || !$area || !$road) return undefined
      return getZipCode6({
        city: $city,
        area: $area,
        road: $road,
        number: $number,
        lane: $lane,
        alley: $alley,
      })
    }
  )

  const zipCode = derived(result, $r => $r?.zipcode ?? '')
  const zip3 = derived(result, $r => $r?.zip3 ?? '')

  return {
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
  }
}

export default createTwZip6
