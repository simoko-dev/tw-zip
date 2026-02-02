import type { Zip6Result } from '../zip6'
import { createMemo, createSignal } from 'solid-js'
import { getAreas6, getCities6, getRoads6, getZipCode6, searchRoads6 } from '../zip6'

export interface SearchResult {
  city: string
  area: string
  road: string
}

export function useTwZip6() {
  const cities = getCities6()
  const initialCity = cities[0] ?? ''
  const initialAreas = initialCity ? getAreas6(initialCity) : []
  const initialArea = initialAreas[0] ?? ''
  const initialRoads = initialCity && initialArea ? getRoads6(initialCity, initialArea) : []
  const initialRoad = initialRoads[0] ?? ''

  const [city, setCityState] = createSignal(initialCity)
  const [area, setAreaState] = createSignal(initialArea)
  const [road, setRoadState] = createSignal(initialRoad)
  const [number, setNumber] = createSignal<number | undefined>(undefined)
  const [lane, setLane] = createSignal<number | undefined>(undefined)
  const [alley, setAlley] = createSignal<number | undefined>(undefined)

  const [areas, setAreas] = createSignal(initialAreas)
  const [roads, setRoads] = createSignal(initialRoads)
  const [searchResults, setSearchResults] = createSignal<SearchResult[]>([])

  // 設定縣市並更新相關狀態
  const setCity = (value: string) => {
    setCityState(value)
    const newAreas = getAreas6(value)
    setAreas(newAreas)
    const firstArea = newAreas[0] ?? ''
    setAreaState(firstArea)

    if (firstArea) {
      const newRoads = getRoads6(value, firstArea)
      setRoads(newRoads)
      setRoadState(newRoads[0] ?? '')
    }
    else {
      setRoads([])
      setRoadState('')
    }

    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }

  // 設定行政區並更新相關狀態
  const setArea = (value: string) => {
    setAreaState(value)
    const newRoads = getRoads6(city(), value)
    setRoads(newRoads)
    setRoadState(newRoads[0] ?? '')
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }

  // 設定路名
  const setRoad = (value: string) => {
    setRoadState(value)
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }

  // 路名搜尋
  const searchRoads = (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }
    const results = searchRoads6(keyword, city() || undefined, area() || undefined)
    setSearchResults(results)
  }

  // 計算郵遞區號結果
  const result = createMemo<Zip6Result | undefined>(() => {
    if (!city() || !area() || !road()) return undefined
    return getZipCode6({
      city: city(),
      area: area(),
      road: road(),
      number: number(),
      lane: lane(),
      alley: alley(),
    })
  })

  const zipCode = createMemo(() => result()?.zipcode ?? '')
  const zip3 = createMemo(() => result()?.zip3 ?? '')

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

export default useTwZip6
