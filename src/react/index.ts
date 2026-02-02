/**
 * @module @simoko/tw-zip/react
 * @description React Hooks 版本的台灣郵遞區號查詢工具
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCityArray, getDistrictArray } from '../'

export { useTwZip6 } from './useTwZip6'
export type { SearchResult } from './useTwZip6'

/**
 * 台灣郵遞區號 React Hook（3碼）
 * @returns 縣市、行政區、郵遞區號的狀態與設定函數
 * @example
 * ```tsx
 * import { useTwZip } from '@simoko/tw-zip/react'
 *
 * function AddressForm() {
 *   const { cities, city, setCity, districts, zipCode } = useTwZip()
 *   return <select value={city} onChange={e => setCity(e.target.value)}>...</select>
 * }
 * ```
 */
export function useTwZip() {
  const cities = useMemo(() => getCityArray(), [])
  const [city, setCity] = useState<string>(cities[0] ?? '')
  const [districts, setDistricts] = useState(() => getDistrictArray(city))
  const [district, setDistrictState] = useState(districts[0]?.label ?? '')
  const [zipCode, setZipCodeState] = useState(districts[0]?.value ?? '')

  // 當縣市改變時，更新行政區列表並重置選擇
  useEffect(() => {
    const ds = getDistrictArray(city)
    setDistricts(ds)
    setDistrictState(ds[0]?.label ?? '')
    setZipCodeState(ds[0]?.value ?? '')
  }, [city])

  // 根據行政區名稱設定郵遞區號
  const setDistrict = useCallback((value: string) => {
    setDistrictState(value)
    const found = districts.find(d => d.label === value)
    if (found)
      setZipCodeState(found.value)
  }, [districts])

  // 根據郵遞區號設定行政區
  const setZipCode = useCallback((value: string) => {
    setZipCodeState(value)
    const found = districts.find(d => d.value === value)
    if (found)
      setDistrictState(found.label)
  }, [districts])

  return {
    cities,
    districts,
    city,
    setCity,
    district,
    setDistrict,
    zipCode,
    setZipCode,
  }
}
