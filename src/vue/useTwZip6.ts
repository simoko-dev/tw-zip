import type { Zip6Result } from '../zip6'
import { computed, ref, watch } from 'vue'
import { getAreas6, getCities6, getRoads6, getZipCode6, searchRoads6 } from '../zip6'

export interface SearchResult {
  city: string
  area: string
  road: string
}

export function useTwZip6() {
  const cities = getCities6()

  const city = ref(cities[0] ?? '')
  const area = ref('')
  const road = ref('')
  const number = ref<number | undefined>(undefined)
  const lane = ref<number | undefined>(undefined)
  const alley = ref<number | undefined>(undefined)

  const areas = ref<string[]>([])
  const roads = ref<string[]>([])
  const searchResults = ref<SearchResult[]>([])

  // 當縣市改變時，更新行政區列表並重置（包含初始化）
  watch(city, (value) => {
    if (!value)
      return
    const newAreas = getAreas6(value)
    areas.value = newAreas
    area.value = newAreas[0] ?? ''
    roads.value = []
    road.value = ''
    number.value = undefined
    lane.value = undefined
    alley.value = undefined
  }, { immediate: true })

  // 當行政區改變時，更新路名列表並重置（包含初始化）
  watch(area, (value) => {
    if (!value)
      return
    const newRoads = getRoads6(city.value, value)
    roads.value = newRoads
    road.value = newRoads[0] ?? ''
    number.value = undefined
    lane.value = undefined
    alley.value = undefined
  }, { immediate: true })

  // 當路名改變時，重置門牌相關
  watch(road, () => {
    number.value = undefined
    lane.value = undefined
    alley.value = undefined
  })

  // 路名搜尋
  function searchRoads(keyword: string) {
    if (!keyword.trim()) {
      searchResults.value = []
      return
    }
    searchResults.value = searchRoads6(
      keyword,
      city.value || undefined,
      area.value || undefined,
    )
  }

  // 計算郵遞區號
  const result = computed<Zip6Result | undefined>(() => {
    if (!city.value || !area.value || !road.value)
      return undefined
    return getZipCode6({
      city: city.value,
      area: area.value,
      road: road.value,
      number: number.value,
      lane: lane.value,
      alley: alley.value,
    })
  })

  const zipCode = computed(() => result.value?.zipcode ?? '')
  const zip3 = computed(() => result.value?.zip3 ?? '')

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

    // 路名搜尋
    searchRoads,
    searchResults,

    // 結果
    zipCode,
    zip3,
    result,
  }
}
