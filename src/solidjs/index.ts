/**
 * @module @simoko/tw-zip/solidjs
 * @description SolidJS 版本的台灣郵遞區號查詢工具
 */

import { createMemo, createSignal } from 'solid-js'
import { getCityArray, getDistrictArray } from '../'

export { useTwZip6 } from './useTwZip6'
export type { SearchResult } from './useTwZip6'

/**
 * 台灣郵遞區號 SolidJS Hook（3碼）
 * @returns 縣市、行政區、郵遞區號的響應式信號
 * @example
 * ```tsx
 * import { useTwZip } from '@simoko/tw-zip/solidjs'
 *
 * function AddressForm() {
 *   const { cities, city, setCity, districts, zipCode } = useTwZip()
 *   return <select value={city()} onChange={e => setCity(e.target.value)}>...</select>
 * }
 * ```
 */
export function useTwZip() {
  const cities = getCityArray()
  const initialCity = cities[0] ?? ''
  const initialDistricts = getDistrictArray(initialCity)

  const [city, setCityState] = createSignal(initialCity)
  const [districts, setDistricts] = createSignal(initialDistricts)
  const [zipCode, setZipCodeState] = createSignal(initialDistricts[0]?.value ?? '')

  // 根據郵遞區號計算行政區名稱
  const district = createMemo(() =>
    districts().find(d => d.value === zipCode())?.label ?? ''
  )

  // 設定縣市並更新行政區
  const setCity = (value: string) => {
    setCityState(value)
    const ds = getDistrictArray(value)
    setDistricts(ds)
    setZipCodeState(ds[0]?.value ?? '')
  }

  // 根據行政區名稱設定郵遞區號
  const setDistrict = (value: string) => {
    const found = districts().find(d => d.label === value)
    if (found) {
      setZipCodeState(found.value)
    }
  }

  // 根據郵遞區號設定
  const setZipCode = (value: string) => {
    setZipCodeState(value)
  }

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

export default useTwZip
