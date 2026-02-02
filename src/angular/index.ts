import { computed, Injectable, signal } from '@angular/core'
import { getCityArray, getDistrictArray } from '../'
import { getAreas6, getCities6, getRoads6, getZipCode6, searchRoads6 } from '../zip6'
import type { Zip6Result } from '../zip6'

export interface SearchResult {
  city: string
  area: string
  road: string
}

@Injectable({
  providedIn: 'root',
})
export class TwZipService {
  readonly cities = getCityArray()

  readonly city = signal(this.cities[0] ?? '')
  readonly districts = signal(getDistrictArray(this.city()))
  readonly zipCode = signal(this.districts()[0]?.value ?? '')

  readonly district = computed(() =>
    this.districts().find(d => d.value === this.zipCode())?.label ?? ''
  )

  setCity(value: string): void {
    this.city.set(value)
    const ds = getDistrictArray(value)
    this.districts.set(ds)
    this.zipCode.set(ds[0]?.value ?? '')
  }

  setDistrict(value: string): void {
    const found = this.districts().find(d => d.label === value)
    if (found) {
      this.zipCode.set(found.value)
    }
  }

  setZipCode(value: string): void {
    this.zipCode.set(value)
  }
}

@Injectable({
  providedIn: 'root',
})
export class TwZip6Service {
  readonly cities = getCities6()

  readonly city = signal(this.cities[0] ?? '')
  readonly area = signal('')
  readonly road = signal('')
  readonly number = signal<number | undefined>(undefined)
  readonly lane = signal<number | undefined>(undefined)
  readonly alley = signal<number | undefined>(undefined)

  readonly areas = signal<string[]>([])
  readonly roads = signal<string[]>([])
  readonly searchResults = signal<SearchResult[]>([])

  readonly result = computed<Zip6Result | undefined>(() => {
    if (!this.city() || !this.area() || !this.road()) return undefined
    return getZipCode6({
      city: this.city(),
      area: this.area(),
      road: this.road(),
      number: this.number(),
      lane: this.lane(),
      alley: this.alley(),
    })
  })

  readonly zipCode = computed(() => this.result()?.zipcode ?? '')
  readonly zip3 = computed(() => this.result()?.zip3 ?? '')

  constructor() {
    // 初始化
    const initialAreas = getAreas6(this.city())
    this.areas.set(initialAreas)
    this.area.set(initialAreas[0] ?? '')

    if (initialAreas[0]) {
      const initialRoads = getRoads6(this.city(), initialAreas[0])
      this.roads.set(initialRoads)
      this.road.set(initialRoads[0] ?? '')
    }
  }

  setCity(value: string): void {
    this.city.set(value)
    const newAreas = getAreas6(value)
    this.areas.set(newAreas)
    const firstArea = newAreas[0] ?? ''
    this.area.set(firstArea)

    if (firstArea) {
      const newRoads = getRoads6(value, firstArea)
      this.roads.set(newRoads)
      this.road.set(newRoads[0] ?? '')
    }
    else {
      this.roads.set([])
      this.road.set('')
    }

    this.number.set(undefined)
    this.lane.set(undefined)
    this.alley.set(undefined)
  }

  setArea(value: string): void {
    this.area.set(value)
    const newRoads = getRoads6(this.city(), value)
    this.roads.set(newRoads)
    this.road.set(newRoads[0] ?? '')
    this.number.set(undefined)
    this.lane.set(undefined)
    this.alley.set(undefined)
  }

  setRoad(value: string): void {
    this.road.set(value)
    this.number.set(undefined)
    this.lane.set(undefined)
    this.alley.set(undefined)
  }

  setNumber(value: number | undefined): void {
    this.number.set(value)
  }

  setLane(value: number | undefined): void {
    this.lane.set(value)
  }

  setAlley(value: number | undefined): void {
    this.alley.set(value)
  }

  searchRoads(keyword: string): void {
    if (!keyword.trim()) {
      this.searchResults.set([])
      return
    }
    const results = searchRoads6(keyword, this.city() || undefined, this.area() || undefined)
    this.searchResults.set(results)
  }
}
