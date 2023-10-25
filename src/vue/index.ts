import { computed, ref, watch } from 'vue'
import { getCityArray, getDistrictArray } from '../'

export default function useTwzip() {
  const cities = getCityArray()

  const city = ref(cities[0])
  const districts = ref(getDistrictArray(city.value))
  const zipCode = ref(districts.value[0].value)

  const district = computed(() => districts.value.find(d => d.value === zipCode.value)?.label)

  watch(city, (v) => {
    districts.value = getDistrictArray(v)
    zipCode.value = districts.value[0].value
  })

  return { cities, districts, city, district, zipCode }
}
