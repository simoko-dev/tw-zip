/**
 * @module @simoko/tw-zip/vue
 * @description Vue Composable 版本的台灣郵遞區號查詢工具
 */

import { computed, ref, watch } from 'vue'
import { getCityArray, getDistrictArray } from '../'

export { useTwZip6 } from './useTwZip6'
export type { SearchResult } from './useTwZip6'

/**
 * 台灣郵遞區號 Vue Composable（3碼）
 * @returns 縣市、行政區、郵遞區號的響應式狀態
 * @example
 * ```vue
 * <script setup>
 * import { useTwZip } from '@simoko/tw-zip/vue'
 * const { cities, city, districts, zipCode } = useTwZip()
 * </script>
 * ```
 */
export function useTwZip() {
  const cities = getCityArray()

  const city = ref(cities[0] ?? '')
  const districts = ref(getDistrictArray(city.value))
  const zipCode = ref(districts.value[0]?.value ?? '')

  // 根據郵遞區號計算行政區名稱
  const district = computed({
    get: () => districts.value.find(d => d.value === zipCode.value)?.label ?? '',
    set: (value: string) => {
      const found = districts.value.find(d => d.label === value)
      if (found)
        zipCode.value = found.value
    },
  })

  // 當縣市改變時，更新行政區列表並重置選擇
  watch(city, (v) => {
    districts.value = getDistrictArray(v)
    zipCode.value = districts.value[0]?.value ?? ''
  })

  return { cities, districts, city, district, zipCode }
}

// 保留 default export 以兼容舊版
export default useTwZip
