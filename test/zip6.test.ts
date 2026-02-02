import { describe, expect, it } from 'vitest'
import {
  getAreas6,
  getCities6,
  getRoads6,
  getZipCode6,
  getZipCodes6ByRoad,
  isValidZipCode6,
  searchRoads6,
} from '../src/zip6'

describe('getCities6', () => {
  it('應返回有 6 碼資料的縣市', () => {
    const cities = getCities6()
    expect(cities).toContain('臺北市')
    expect(cities).toContain('高雄市')
    expect(cities.length).toBeGreaterThan(0)
  })
})

describe('getAreas6', () => {
  it('應返回指定縣市的行政區', () => {
    const areas = getAreas6('臺北市')
    expect(areas).toContain('中正區')
    expect(areas).toContain('大安區')
  })

  it('不存在的縣市應返回空陣列', () => {
    expect(getAreas6('不存在的縣市')).toEqual([])
  })
})

describe('getRoads6', () => {
  it('應返回指定行政區的路名', () => {
    const roads = getRoads6('臺北市', '中正區')
    expect(roads).toContain('三元街')
    expect(roads.length).toBeGreaterThan(0)
  })

  it('不存在的縣市應返回空陣列', () => {
    expect(getRoads6('不存在', '中正區')).toEqual([])
  })

  it('不存在的行政區應返回空陣列', () => {
    expect(getRoads6('臺北市', '不存在')).toEqual([])
  })
})

describe('getZipCode6', () => {
  it('應根據地址查詢 6 碼郵遞區號', () => {
    const result = getZipCode6({
      city: '臺北市',
      area: '中正區',
      road: '三元街',
      number: 145,
    })
    expect(result).toBeDefined()
    expect(result?.zipcode).toHaveLength(6)
    expect(result?.zip3).toBe('100')
    expect(result?.city).toBe('臺北市')
    expect(result?.area).toBe('中正區')
    expect(result?.road).toBe('三元街')
  })

  it('只提供路名也應返回結果', () => {
    const result = getZipCode6({
      city: '臺北市',
      area: '中正區',
      road: '三元街',
    })
    expect(result).toBeDefined()
    expect(result?.zipcode).toHaveLength(6)
  })

  it('不存在的縣市應返回 undefined', () => {
    const result = getZipCode6({
      city: '不存在',
      area: '中正區',
      road: '三元街',
    })
    expect(result).toBeUndefined()
  })

  it('不存在的行政區應返回 undefined', () => {
    const result = getZipCode6({
      city: '臺北市',
      area: '不存在',
      road: '三元街',
    })
    expect(result).toBeUndefined()
  })

  it('不存在的路名應返回 undefined', () => {
    const result = getZipCode6({
      city: '臺北市',
      area: '中正區',
      road: '不存在的路',
    })
    expect(result).toBeUndefined()
  })
})

describe('getZipCodes6ByRoad', () => {
  it('應返回路名的所有 6 碼郵遞區號', () => {
    const zipcodes = getZipCodes6ByRoad('臺北市', '中正區', '三元街')
    expect(zipcodes.length).toBeGreaterThan(0)
    zipcodes.forEach((code) => {
      expect(code).toHaveLength(6)
      expect(code.startsWith('100')).toBe(true)
    })
  })

  it('不存在的路名應返回空陣列', () => {
    expect(getZipCodes6ByRoad('臺北市', '中正區', '不存在')).toEqual([])
  })
})

describe('searchRoads6', () => {
  it('應搜尋包含關鍵字的路名', () => {
    const results = searchRoads6('三元')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.road === '三元街')).toBe(true)
  })

  it('可限定縣市搜尋', () => {
    const results = searchRoads6('中山', '臺北市')
    expect(results.every(r => r.city === '臺北市')).toBe(true)
  })

  it('可限定行政區搜尋', () => {
    const results = searchRoads6('中山', '臺北市', '中正區')
    expect(results.every(r => r.city === '臺北市' && r.area === '中正區')).toBe(true)
  })

  it('空字串應返回空陣列', () => {
    expect(searchRoads6('')).toEqual([])
    expect(searchRoads6('  ')).toEqual([])
  })

  it('找不到結果應返回空陣列', () => {
    expect(searchRoads6('完全不存在的路名xyz')).toEqual([])
  })
})

describe('isValidZipCode6', () => {
  it('有效 6 碼郵遞區號應返回 true', () => {
    const zipcodes = getZipCodes6ByRoad('臺北市', '中正區', '三元街')
    if (zipcodes.length > 0) {
      expect(isValidZipCode6(zipcodes[0])).toBe(true)
    }
  })

  it('無效格式應返回 false', () => {
    expect(isValidZipCode6('100')).toBe(false) // 只有 3 碼
    expect(isValidZipCode6('1000000')).toBe(false) // 7 碼
    expect(isValidZipCode6('abcdef')).toBe(false) // 非數字
  })

  it('不存在的郵遞區號應返回 false', () => {
    expect(isValidZipCode6('999999')).toBe(false)
  })
})
