import { derived, readable, writable } from 'svelte/store'
import { getCityArray, getDistrictArray } from '../'

export { createTwZip6 } from './useTwZip6'
export type { SearchResult } from './useTwZip6'

export function createTwZip() {
  const cities = readable(getCityArray())

  const city = writable(getCityArray()[0] ?? '')
  const districts = writable(getDistrictArray(getCityArray()[0] ?? ''))
  const zipCode = writable('')

  // 初始化 zipCode
  const initialDistricts = getDistrictArray(getCityArray()[0] ?? '')
  if (initialDistricts.length > 0) {
    zipCode.set(initialDistricts[0].value)
  }

  // 監聽 city 變化，更新 districts 和 zipCode
  city.subscribe(($city) => {
    if (!$city) return
    const ds = getDistrictArray($city)
    districts.set(ds)
    zipCode.set(ds[0]?.value ?? '')
  })

  // 根據 zipCode 計算 district 名稱
  const district = derived(
    [districts, zipCode],
    ([$districts, $zipCode]) =>
      $districts.find(d => d.value === $zipCode)?.label ?? ''
  )

  // 根據行政區名稱設定郵遞區號
  function setDistrict(value: string) {
    districts.subscribe($districts => {
      const found = $districts.find(d => d.label === value)
      if (found) {
        zipCode.set(found.value)
      }
    })()
  }

  // 根據郵遞區號設定（直接設定 zipCode）
  function setZipCode(value: string) {
    zipCode.set(value)
  }

  // 設定縣市
  function setCity(value: string) {
    city.set(value)
  }

  return {
    cities,
    districts,
    city,
    district,
    zipCode,
    setCity,
    setDistrict,
    setZipCode,
  }
}

export default createTwZip
