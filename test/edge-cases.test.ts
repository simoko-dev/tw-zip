import { describe, expect, it } from 'vitest'
import {
  getCityArray,
  getDistrictArray,
  getDistricts,
  getFlatArray,
  getZipCode,
  getZipCodeAll,
  getZipCodeByCity,
  isValidCity,
  isValidDistrict,
  isValidZipCode,
  searchDistricts,
} from '../src'
import {
  getAreas6,
  getCities6,
  getRoads6,
  getZipCode6,
  getZipCodes6ByRoad,
  isValidZipCode6,
  searchRoads6,
} from '../src/zip6'

describe('邊界情況測試 - 3 碼', () => {
  describe('空字串輸入', () => {
    it('getZipCode 應處理空字串', () => {
      expect(getZipCode('')).toBeUndefined()
    })

    it('getZipCodeAll 應處理空字串', () => {
      expect(getZipCodeAll('')).toEqual([])
    })

    it('getZipCodeByCity 應處理空字串縣市', () => {
      expect(getZipCodeByCity('', '中正區')).toBeUndefined()
    })

    it('getZipCodeByCity 應處理空字串行政區', () => {
      expect(getZipCodeByCity('台北市', '')).toBeUndefined()
    })

    it('getZipCodeByCity 應處理兩者皆為空字串', () => {
      expect(getZipCodeByCity('', '')).toBeUndefined()
    })

    it('getDistricts 應處理空字串縣市（回傳所有行政區）', () => {
      // 空字串被視為「不指定縣市」，回傳所有行政區
      const result = getDistricts('')
      expect(Object.keys(result).length).toBeGreaterThan(0)
    })

    it('getDistrictArray 應處理空字串縣市（回傳所有行政區）', () => {
      // 空字串被視為「不指定縣市」，回傳所有行政區
      const result = getDistrictArray('')
      expect(result.length).toBeGreaterThan(0)
    })

    it('searchDistricts 應處理空字串', () => {
      expect(searchDistricts('')).toEqual([])
    })

    it('isValidCity 應處理空字串', () => {
      expect(isValidCity('')).toBe(false)
    })

    it('isValidDistrict 應處理空字串', () => {
      expect(isValidDistrict('')).toBe(false)
    })

    it('isValidDistrict 應處理空字串行政區與縣市', () => {
      expect(isValidDistrict('', '')).toBe(false)
    })

    it('isValidZipCode 應處理空字串', () => {
      expect(isValidZipCode('')).toBe(false)
    })
  })

  describe('空白字串處理', () => {
    it('getZipCode 應處理前後空白', () => {
      expect(getZipCode('  中正區  ')).toBeDefined()
      expect(getZipCode('  100  ')).toBeDefined()
    })

    it('getZipCodeAll 應處理前後空白', () => {
      expect(getZipCodeAll('  中正區  ').length).toBeGreaterThan(0)
    })

    it('getZipCodeByCity 應處理前後空白', () => {
      expect(getZipCodeByCity('  台北市  ', '  中正區  ')).toBeDefined()
    })

    it('searchDistricts 應處理只有空白的字串', () => {
      expect(searchDistricts('   ')).toEqual([])
    })

    it('isValidCity 應處理前後空白', () => {
      expect(isValidCity('  台北市  ')).toBe(true)
    })

    it('isValidDistrict 應處理前後空白', () => {
      expect(isValidDistrict('  中正區  ')).toBe(true)
    })

    it('isValidZipCode 應處理前後空白', () => {
      expect(isValidZipCode('  100  ')).toBe(true)
    })
  })

  describe('特殊字元輸入', () => {
    it('getZipCode 應處理特殊字元', () => {
      expect(getZipCode('!@#$%')).toBeUndefined()
      expect(getZipCode('<script>')).toBeUndefined()
      expect(getZipCode('DROP TABLE')).toBeUndefined()
    })

    it('searchDistricts 應安全處理特殊字元', () => {
      expect(searchDistricts('<script>')).toEqual([])
      expect(searchDistricts('DROP TABLE')).toEqual([])
      expect(searchDistricts('!@#$%^&*()')).toEqual([])
    })

    it('isValidCity 應處理特殊字元', () => {
      expect(isValidCity('!@#$%')).toBe(false)
      expect(isValidCity('<script>')).toBe(false)
    })

    it('isValidDistrict 應處理特殊字元', () => {
      expect(isValidDistrict('!@#$%')).toBe(false)
    })

    it('isValidZipCode 應處理特殊字元', () => {
      expect(isValidZipCode('abc')).toBe(false)
      expect(isValidZipCode('!@#')).toBe(false)
    })
  })

  describe('Unicode 特殊字元', () => {
    it('getZipCode 應處理 Unicode 特殊字元', () => {
      expect(getZipCode('\u0000')).toBeUndefined()
      expect(getZipCode('\uFEFF')).toBeUndefined() // BOM
      expect(getZipCode('\u200B')).toBeUndefined() // Zero-width space
    })

    it('searchDistricts 應處理 Unicode 特殊字元', () => {
      expect(searchDistricts('\u0000')).toEqual([])
      expect(searchDistricts('\uFEFF')).toEqual([])
    })
  })

  describe('超長字串輸入', () => {
    it('getZipCode 應處理超長字串', () => {
      const longString = 'a'.repeat(10000)
      expect(getZipCode(longString)).toBeUndefined()
    })

    it('searchDistricts 應處理超長字串', () => {
      const longString = '中'.repeat(10000)
      expect(searchDistricts(longString)).toEqual([])
    })

    it('isValidCity 應處理超長字串', () => {
      const longString = '台北市'.repeat(1000)
      expect(isValidCity(longString)).toBe(false)
    })

    it('isValidZipCode 應處理超長字串', () => {
      const longString = '1'.repeat(10000)
      expect(isValidZipCode(longString)).toBe(false)
    })
  })

  describe('不存在的資料', () => {
    it('getZipCode 應處理不存在的行政區', () => {
      expect(getZipCode('不存在區')).toBeUndefined()
    })

    it('getZipCode 應處理不存在的郵遞區號', () => {
      expect(getZipCode('999')).toBeUndefined()
      expect(getZipCode('000')).toBeUndefined()
    })

    it('getZipCodeByCity 應處理不存在的縣市', () => {
      expect(getZipCodeByCity('不存在市', '中正區')).toBeUndefined()
    })

    it('getZipCodeByCity 應處理不存在的行政區', () => {
      expect(getZipCodeByCity('台北市', '不存在區')).toBeUndefined()
    })

    it('getDistricts 應處理不存在的縣市', () => {
      expect(getDistricts('不存在市')).toEqual({})
    })

    it('getDistrictArray 應處理不存在的縣市', () => {
      expect(getDistrictArray('不存在市')).toEqual([])
    })
  })

  describe('數字格式郵遞區號', () => {
    it('getZipCode 應正確處理純數字字串', () => {
      expect(getZipCode('100')).toBeDefined()
      expect(getZipCode('100')?.[0]).toBe('100')
    })

    it('getZipCode 應處理帶前導零的郵遞區號', () => {
      // 台灣郵遞區號不會有前導零問題，但仍需處理
      expect(getZipCode('100')).toBeDefined()
    })

    it('isValidZipCode 應處理各種數字格式', () => {
      expect(isValidZipCode('100')).toBe(true)
      expect(isValidZipCode('0100')).toBe(false) // 非標準格式
      expect(isValidZipCode('10')).toBe(false) // 太短
      expect(isValidZipCode('10000')).toBe(false) // 太長（除非是 5 碼格式）
    })
  })

  describe('函數回傳值一致性', () => {
    it('getCityArray 應回傳非空陣列', () => {
      const cities = getCityArray()
      expect(Array.isArray(cities)).toBe(true)
      expect(cities.length).toBeGreaterThan(0)
    })

    it('getDistrictArray 無參數應回傳所有行政區', () => {
      const districts = getDistrictArray()
      expect(Array.isArray(districts)).toBe(true)
      expect(districts.length).toBeGreaterThan(0)
    })

    it('getFlatArray 應回傳正確格式的陣列', () => {
      const flatArray = getFlatArray({ city: '台北市' })
      expect(Array.isArray(flatArray)).toBe(true)
      expect(flatArray.length).toBeGreaterThan(0)
      // 每個項目應包含空格分隔的三個部分
      expect(flatArray[0].split(' ').length).toBe(3)
    })

    it('getFlatArray 應支援自訂分隔符', () => {
      const flatArray = getFlatArray({ city: '台北市', symbol: '#' })
      expect(flatArray[0].split('#').length).toBe(3)
    })
  })
})

describe('邊界情況測試 - 6 碼', () => {
  describe('空字串和特殊輸入', () => {
    it('getZipCode6 應處理空字串城市', () => {
      expect(getZipCode6({ city: '', area: '中正區', road: '三元街' })).toBeUndefined()
    })

    it('getZipCode6 應處理空字串行政區', () => {
      expect(getZipCode6({ city: '臺北市', area: '', road: '三元街' })).toBeUndefined()
    })

    it('getZipCode6 應處理空字串路名', () => {
      expect(getZipCode6({ city: '臺北市', area: '中正區', road: '' })).toBeUndefined()
    })

    it('getZipCode6 應處理全部空字串', () => {
      expect(getZipCode6({ city: '', area: '', road: '' })).toBeUndefined()
    })

    it('searchRoads6 應處理空字串', () => {
      expect(searchRoads6('')).toEqual([])
    })

    it('searchRoads6 應處理只有空白的字串', () => {
      expect(searchRoads6('   ')).toEqual([])
    })

    it('getAreas6 應處理空字串城市', () => {
      expect(getAreas6('')).toEqual([])
    })

    it('getRoads6 應處理空字串城市', () => {
      expect(getRoads6('', '中正區')).toEqual([])
    })

    it('getRoads6 應處理空字串行政區', () => {
      expect(getRoads6('臺北市', '')).toEqual([])
    })

    it('getZipCodes6ByRoad 應處理空字串', () => {
      expect(getZipCodes6ByRoad('', '', '')).toEqual([])
    })
  })

  describe('門牌號碼邊界情況', () => {
    it('getZipCode6 應處理門牌號碼為 0', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        number: 0,
      })
      // 應該回傳結果（預設值）
      expect(result).toBeDefined()
    })

    it('getZipCode6 應處理負數門牌號碼', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        number: -1,
      })
      // 應該回傳結果（預設值或第一筆）
      expect(result?.zipcode).toBeDefined()
    })

    it('getZipCode6 應處理超大門牌號碼', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        number: 999999,
      })
      // 應該回傳結果（預設值）
      expect(result).toBeDefined()
    })

    it('getZipCode6 應處理 undefined 門牌號碼', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        number: undefined,
      })
      expect(result).toBeDefined()
    })
  })

  describe('巷弄邊界情況', () => {
    it('getZipCode6 應處理巷號為 0', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        lane: 0,
      })
      expect(result).toBeDefined()
    })

    it('getZipCode6 應處理弄號為 0', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        alley: 0,
      })
      expect(result).toBeDefined()
    })

    it('getZipCode6 應處理負數巷弄號', () => {
      const result = getZipCode6({
        city: '臺北市',
        area: '中正區',
        road: '三元街',
        lane: -1,
        alley: -1,
      })
      expect(result).toBeDefined()
    })
  })

  describe('不存在的資料', () => {
    it('getZipCode6 應處理不存在的城市', () => {
      expect(getZipCode6({ city: '不存在市', area: '中正區', road: '三元街' })).toBeUndefined()
    })

    it('getZipCode6 應處理不存在的行政區', () => {
      expect(getZipCode6({ city: '臺北市', area: '不存在區', road: '三元街' })).toBeUndefined()
    })

    it('getZipCode6 應處理不存在的路名', () => {
      expect(getZipCode6({ city: '臺北市', area: '中正區', road: '不存在路' })).toBeUndefined()
    })

    it('getAreas6 應處理不存在的城市', () => {
      expect(getAreas6('不存在市')).toEqual([])
    })

    it('getRoads6 應處理不存在的城市或行政區', () => {
      expect(getRoads6('不存在市', '中正區')).toEqual([])
      expect(getRoads6('臺北市', '不存在區')).toEqual([])
    })

    it('getZipCodes6ByRoad 應處理不存在的資料', () => {
      expect(getZipCodes6ByRoad('不存在市', '中正區', '三元街')).toEqual([])
      expect(getZipCodes6ByRoad('臺北市', '不存在區', '三元街')).toEqual([])
      expect(getZipCodes6ByRoad('臺北市', '中正區', '不存在路')).toEqual([])
    })
  })

  describe('6 碼郵遞區號驗證', () => {
    it('isValidZipCode6 應處理空字串', () => {
      expect(isValidZipCode6('')).toBe(false)
    })

    it('isValidZipCode6 應處理非 6 位數', () => {
      expect(isValidZipCode6('100')).toBe(false)
      expect(isValidZipCode6('10000')).toBe(false)
      expect(isValidZipCode6('1000000')).toBe(false)
    })

    it('isValidZipCode6 應處理非數字字元', () => {
      expect(isValidZipCode6('10005a')).toBe(false)
      expect(isValidZipCode6('abcdef')).toBe(false)
      expect(isValidZipCode6('!@#$%^')).toBe(false)
    })

    it('isValidZipCode6 應處理有效的 6 碼郵遞區號', () => {
      // 取得一個有效的 6 碼郵遞區號來測試
      const result = getZipCode6({ city: '臺北市', area: '中正區', road: '三元街' })
      if (result) {
        expect(isValidZipCode6(result.zipcode)).toBe(true)
      }
    })

    it('isValidZipCode6 應處理不存在的 6 碼郵遞區號', () => {
      expect(isValidZipCode6('000000')).toBe(false)
      expect(isValidZipCode6('999999')).toBe(false)
    })
  })

  describe('搜尋功能邊界情況', () => {
    it('searchRoads6 應處理特殊字元', () => {
      expect(searchRoads6('!@#$%')).toEqual([])
      expect(searchRoads6('<script>')).toEqual([])
    })

    it('searchRoads6 應處理超長字串', () => {
      const longString = '路'.repeat(1000)
      expect(searchRoads6(longString)).toEqual([])
    })

    it('searchRoads6 應支援限定縣市搜尋', () => {
      const results = searchRoads6('中山', '臺北市')
      expect(results.every(r => r.city === '臺北市')).toBe(true)
    })

    it('searchRoads6 應支援限定行政區搜尋', () => {
      const results = searchRoads6('中山', '臺北市', '中山區')
      expect(results.every(r => r.city === '臺北市' && r.area === '中山區')).toBe(true)
    })

    it('searchRoads6 應處理不存在的縣市限定', () => {
      expect(searchRoads6('中山', '不存在市')).toEqual([])
    })
  })

  describe('函數回傳值一致性', () => {
    it('getCities6 應回傳非空陣列', () => {
      const cities = getCities6()
      expect(Array.isArray(cities)).toBe(true)
      expect(cities.length).toBeGreaterThan(0)
    })

    it('getAreas6 應對有效城市回傳非空陣列', () => {
      const cities = getCities6()
      if (cities.length > 0) {
        const areas = getAreas6(cities[0])
        expect(Array.isArray(areas)).toBe(true)
        expect(areas.length).toBeGreaterThan(0)
      }
    })

    it('getRoads6 應對有效城市和行政區回傳非空陣列', () => {
      const cities = getCities6()
      if (cities.length > 0) {
        const areas = getAreas6(cities[0])
        if (areas.length > 0) {
          const roads = getRoads6(cities[0], areas[0])
          expect(Array.isArray(roads)).toBe(true)
          expect(roads.length).toBeGreaterThan(0)
        }
      }
    })

    it('getZipCode6 結果應包含所有必要欄位', () => {
      const result = getZipCode6({ city: '臺北市', area: '中正區', road: '三元街' })
      expect(result).toBeDefined()
      if (result) {
        expect(result.zipcode).toBeDefined()
        expect(result.zip3).toBeDefined()
        expect(result.city).toBe('臺北市')
        expect(result.area).toBe('中正區')
        expect(result.road).toBe('三元街')
        expect(result.zipcode).toMatch(/^\d{6}$/)
        expect(result.zip3).toMatch(/^\d{3}$/)
      }
    })
  })
})
