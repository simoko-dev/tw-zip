import { useEffect, useState } from 'react'
import { getCityArray, getDistrictArray } from '../'

export function useTwZip() {
  const cities = getCityArray()
  const [city, setCity] = useState<string>(cities[0])
  const [districts, setDistricts] = useState(getDistrictArray(city))
  const [district, setDistrict] = useState(districts[0].label)
  const [zipCode, setZipCode] = useState(districts[0].value)

  useEffect(() => {
    const ds = getDistrictArray(city)
    setDistricts(ds)
    setDistrict(ds[0].label)
    setZipCode(ds[0].value)
  }, [city])

  useEffect(() => {
    setZipCode(districts.find(d => d.label === district)?.value || '')
  }, [district])

  return {
    cities,
    districts,
    city,
    setCity,
    district,
    setDistrict,
    zipCode,
  }
}
