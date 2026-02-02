/**
 * @module @simoko/tw-zip/angular
 * @description Angular Service 版本的台灣郵遞區號查詢工具
 */

import type { Signal, WritableSignal } from '@angular/core'
import { computed, Injectable, signal } from '@angular/core'
import { getCityArray, getDistrictArray } from '../'
import { getAreas6, getCities6, getRoads6, getZipCode6, searchRoads6 } from '../zip6'
import type { Zip6Result } from '../zip6'

/** 搜尋結果介面 */
export interface SearchResult {
  city: string
  area: string
  road: string
}

/** 行政區選項類型 */
export type DistrictOption = { [key: string]: string }

/**
 * 台灣郵遞區號服務（3碼）
 * @description 提供縣市、行政區、郵遞區號的響應式查詢功能
 * @example
 * ```typescript
 * import { TwZipService } from '@simoko/tw-zip/angular'
 *
 * @Component({ ... })
 * export class MyComponent {
 *   constructor(public twZip: TwZipService) {}
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class TwZipService {
  /** 所有縣市列表 */
  readonly cities: string[] = getCityArray()

  /** 目前選中的縣市 */
  readonly city: WritableSignal<string> = signal(this.cities[0] ?? '')
  /** 目前縣市的行政區列表 */
  readonly districts: WritableSignal<DistrictOption[]> = signal(getDistrictArray(this.city()))
  /** 目前選中的郵遞區號 */
  readonly zipCode: WritableSignal<string> = signal(this.districts()[0]?.value ?? '')

  /** 目前選中的行政區名稱（根據郵遞區號計算） */
  readonly district: Signal<string> = computed(() =>
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

/**
 * 台灣郵遞區號服務（6碼 / 3+3碼）
 * @description 提供精確到路段的 6 碼郵遞區號查詢功能
 * @example
 * ```typescript
 * import { TwZip6Service } from '@simoko/tw-zip/angular'
 *
 * @Component({ ... })
 * export class MyComponent {
 *   constructor(public twZip6: TwZip6Service) {}
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class TwZip6Service {
  /** 所有縣市列表 */
  readonly cities: string[] = getCities6()

  /** 目前選中的縣市 */
  readonly city: WritableSignal<string> = signal(this.cities[0] ?? '')
  /** 目前選中的行政區 */
  readonly area: WritableSignal<string> = signal('')
  /** 目前選中的路名 */
  readonly road: WritableSignal<string> = signal('')
  /** 門牌號碼 */
  readonly number: WritableSignal<number | undefined> = signal<number | undefined>(undefined)
  /** 巷 */
  readonly lane: WritableSignal<number | undefined> = signal<number | undefined>(undefined)
  /** 弄 */
  readonly alley: WritableSignal<number | undefined> = signal<number | undefined>(undefined)

  /** 目前縣市的行政區列表 */
  readonly areas: WritableSignal<string[]> = signal<string[]>([])
  /** 目前行政區的路名列表 */
  readonly roads: WritableSignal<string[]> = signal<string[]>([])
  /** 搜尋結果 */
  readonly searchResults: WritableSignal<SearchResult[]> = signal<SearchResult[]>([])

  /** 完整查詢結果 */
  readonly result: Signal<Zip6Result | undefined> = computed<Zip6Result | undefined>(() => {
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

  /** 6碼郵遞區號 */
  readonly zipCode: Signal<string> = computed(() => this.result()?.zipcode ?? '')
  /** 3碼郵遞區號 */
  readonly zip3: Signal<string> = computed(() => this.result()?.zip3 ?? '')

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
