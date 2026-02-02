import type { ICity, IDistrict } from '../src'

import { assertType, describe, expect, it } from 'vitest'
import {
  getCityArray,
  getData,
  getDistrictArray,
  getDistricts,
  getFlatArray,
  getZipCode,
  getZipCodeByCity,
  isValidCity,
  isValidDistrict,
  isValidZipCode,
  searchDistricts,
} from '../src'

describe('getData', () => {
  it('應返回 ICity 型別', () => {
    assertType<ICity>(getData())
  })
})

describe('getCityArray', () => {
  it('應包含嘉義縣', () => {
    expect(getCityArray()).toContain('嘉義縣')
  })
})

describe('getDistricts', () => {
  it('指定縣市應返回 IDistrict 型別', () => {
    assertType<IDistrict>(getDistricts('台北市'))
  })

  it('不指定縣市應返回所有行政區', () => {
    expect(getDistricts()).toMatchObject({ 太麻里鄉: '963' })
  })

  it('不存在的縣市應返回空物件', () => {
    expect(getDistricts('不存在的縣市')).toEqual({})
  })
})

describe('getDistrictArray', () => {
  it('應支援自訂 label 鍵名', () => {
    const result = JSON.stringify(getDistrictArray(null, { label: 'key' }))
    expect(result).toContain('{"key":"峨嵋鄉","value":"315"}')
    expect(result).toContain('{"key":"中壢區","value":"320"}')
  })
})

describe('getFlatArray', () => {
  it('應支援自訂分隔符號', () => {
    expect(getFlatArray({ city: '嘉義市', symbol: '#' })).toMatchObject(['600#嘉義市#東區', '600#嘉義市#西區'])
  })
})

describe('getZipCode', () => {
  it('根據行政區名稱查詢', () => {
    expect(getZipCode('三民區')).toEqual(['807', '高雄市', '三民區'])
  })

  it('根據郵遞區號查詢', () => {
    expect(getZipCode('807')).toEqual(['807', '高雄市', '三民區'])
  })

  it('不存在的行政區應返回 undefined', () => {
    expect(getZipCode('不存在的區')).toBeUndefined()
  })

  it('不存在的郵遞區號應返回 undefined', () => {
    expect(getZipCode('999')).toBeUndefined()
  })
})

describe('getZipCodeByCity', () => {
  it('應正確處理同名行政區', () => {
    expect(getZipCodeByCity('台北市', '中正區')).toEqual(['100', '台北市', '中正區'])
    expect(getZipCodeByCity('基隆市', '中正區')).toEqual(['202', '基隆市', '中正區'])
  })

  it('不存在的縣市應返回 undefined', () => {
    expect(getZipCodeByCity('不存在', '中正區')).toBeUndefined()
  })

  it('不存在的行政區應返回 undefined', () => {
    expect(getZipCodeByCity('台北市', '不存在')).toBeUndefined()
  })
})

describe('searchDistricts', () => {
  it('應找到所有包含關鍵字的行政區', () => {
    const results = searchDistricts('中正')
    expect(results.length).toBeGreaterThan(1)
    expect(results).toContainEqual(['100', '台北市', '中正區'])
    expect(results).toContainEqual(['202', '基隆市', '中正區'])
  })

  it('空字串應返回空陣列', () => {
    expect(searchDistricts('')).toEqual([])
    expect(searchDistricts('  ')).toEqual([])
  })

  it('找不到結果應返回空陣列', () => {
    expect(searchDistricts('不存在的地名')).toEqual([])
  })
})

describe('isValidCity', () => {
  it('有效縣市應返回 true', () => {
    expect(isValidCity('台北市')).toBe(true)
    expect(isValidCity('高雄市')).toBe(true)
  })

  it('無效縣市應返回 false', () => {
    expect(isValidCity('東京都')).toBe(false)
    expect(isValidCity('')).toBe(false)
  })
})

describe('isValidDistrict', () => {
  it('有效行政區應返回 true', () => {
    expect(isValidDistrict('中正區')).toBe(true)
  })

  it('指定縣市時應驗證該縣市內的行政區', () => {
    expect(isValidDistrict('中正區', '台北市')).toBe(true)
    expect(isValidDistrict('中正區', '高雄市')).toBe(false)
  })

  it('無效行政區應返回 false', () => {
    expect(isValidDistrict('不存在的區')).toBe(false)
  })
})

describe('isValidZipCode', () => {
  it('有效郵遞區號應返回 true', () => {
    expect(isValidZipCode('100')).toBe(true)
    expect(isValidZipCode('807')).toBe(true)
  })

  it('無效郵遞區號應返回 false', () => {
    expect(isValidZipCode('999')).toBe(false)
    expect(isValidZipCode('000')).toBe(false)
  })
})
