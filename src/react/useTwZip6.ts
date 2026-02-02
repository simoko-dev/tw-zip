import type { Zip6Result } from '../zip6'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAreas6, getCities6, getRoads6, getZipCode6, searchRoads6 } from '../zip6'

export interface SearchResult {
  city: string
  area: string
  road: string
}

export function useTwZip6() {
  const cities = useMemo(() => getCities6(), [])

  const [city, setCityState] = useState<string>(cities[0] ?? '')
  const [area, setAreaState] = useState<string>('')
  const [road, setRoadState] = useState<string>('')
  const [number, setNumber] = useState<number | undefined>(undefined)
  const [lane, setLane] = useState<number | undefined>(undefined)
  const [alley, setAlley] = useState<number | undefined>(undefined)

  const [areas, setAreas] = useState<string[]>([])
  const [roads, setRoads] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // 初始化 areas 和 roads（只在 mount 時執行）
  useEffect(() => {
    if (city) {
      const newAreas = getAreas6(city)
      setAreas(newAreas)
      const firstArea = newAreas[0] ?? ''
      setAreaState(firstArea)

      // 初始化 roads
      if (firstArea) {
        const newRoads = getRoads6(city, firstArea)
        setRoads(newRoads)
        setRoadState(newRoads[0] ?? '')
      }
    }
  }, [])

  // 當縣市改變時，更新行政區列表並重置
  const setCity = useCallback((value: string) => {
    setCityState(value)
    const newAreas = getAreas6(value)
    setAreas(newAreas)
    setAreaState(newAreas[0] ?? '')
    setRoads([])
    setRoadState('')
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }, [])

  // 當行政區改變時，更新路名列表並重置
  const setArea = useCallback((value: string) => {
    setAreaState(value)
    const newRoads = getRoads6(city, value)
    setRoads(newRoads)
    setRoadState(newRoads[0] ?? '')
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }, [city])

  // 當路名改變時，重置門牌相關
  const setRoad = useCallback((value: string) => {
    setRoadState(value)
    setNumber(undefined)
    setLane(undefined)
    setAlley(undefined)
  }, [])

  // 路名搜尋
  const searchRoads = useCallback((keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }
    const results = searchRoads6(keyword, city || undefined, area || undefined)
    setSearchResults(results)
  }, [city, area])

  // 計算郵遞區號
  const result = useMemo<Zip6Result | undefined>(() => {
    if (!city || !area || !road)
      return undefined
    return getZipCode6({ city, area, road, number, lane, alley })
  }, [city, area, road, number, lane, alley])

  const zipCode = result?.zipcode ?? ''
  const zip3 = result?.zip3 ?? ''

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
