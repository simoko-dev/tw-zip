import { bench, describe } from 'vitest'
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

describe('3 碼郵遞區號 - 資料查詢效能', () => {
  bench('getCityArray', () => {
    getCityArray()
  })

  bench('getDistricts - 指定縣市', () => {
    getDistricts('台北市')
  })

  bench('getDistricts - 全部', () => {
    getDistricts()
  })

  bench('getDistrictArray - 指定縣市', () => {
    getDistrictArray('台北市')
  })

  bench('getDistrictArray - 全部', () => {
    getDistrictArray()
  })

  bench('getFlatArray - 指定縣市', () => {
    getFlatArray({ city: '台北市' })
  })

  bench('getFlatArray - 全部', () => {
    getFlatArray()
  })
})

describe('3 碼郵遞區號 - 查詢效能', () => {
  bench('getZipCode - 行政區查詢', () => {
    getZipCode('中正區')
  })

  bench('getZipCode - 郵遞區號查詢', () => {
    getZipCode('100')
  })

  bench('getZipCodeAll - 行政區查詢', () => {
    getZipCodeAll('中正區')
  })

  bench('getZipCodeAll - 郵遞區號查詢', () => {
    getZipCodeAll('300')
  })

  bench('getZipCodeByCity', () => {
    getZipCodeByCity('台北市', '中正區')
  })
})

describe('3 碼郵遞區號 - 搜尋效能', () => {
  bench('searchDistricts - 單字關鍵字', () => {
    searchDistricts('中')
  })

  bench('searchDistricts - 雙字關鍵字', () => {
    searchDistricts('中正')
  })

  bench('searchDistricts - 縣市名關鍵字', () => {
    searchDistricts('台北')
  })
})

describe('3 碼郵遞區號 - 驗證效能', () => {
  bench('isValidCity - 有效', () => {
    isValidCity('台北市')
  })

  bench('isValidCity - 無效', () => {
    isValidCity('不存在市')
  })

  bench('isValidDistrict - 有效', () => {
    isValidDistrict('中正區')
  })

  bench('isValidDistrict - 有效（指定縣市）', () => {
    isValidDistrict('中正區', '台北市')
  })

  bench('isValidDistrict - 無效', () => {
    isValidDistrict('不存在區')
  })

  bench('isValidZipCode - 有效', () => {
    isValidZipCode('100')
  })

  bench('isValidZipCode - 無效', () => {
    isValidZipCode('999')
  })
})

describe('6 碼郵遞區號 - 資料查詢效能', () => {
  bench('getCities6', () => {
    getCities6()
  })

  bench('getAreas6', () => {
    getAreas6('臺北市')
  })

  bench('getRoads6', () => {
    getRoads6('臺北市', '中正區')
  })
})

describe('6 碼郵遞區號 - 查詢效能', () => {
  bench('getZipCode6 - 只有路名', () => {
    getZipCode6({ city: '臺北市', area: '中正區', road: '三元街' })
  })

  bench('getZipCode6 - 含門牌號碼', () => {
    getZipCode6({
      city: '臺北市',
      area: '中正區',
      road: '三元街',
      number: 145,
    })
  })

  bench('getZipCode6 - 完整地址', () => {
    getZipCode6({
      city: '臺北市',
      area: '中正區',
      road: '三元街',
      number: 145,
      lane: 0,
      alley: 0,
    })
  })

  bench('getZipCodes6ByRoad', () => {
    getZipCodes6ByRoad('臺北市', '中正區', '三元街')
  })
})

describe('6 碼郵遞區號 - 搜尋效能', () => {
  bench('searchRoads6 - 單字關鍵字', () => {
    searchRoads6('三')
  })

  bench('searchRoads6 - 雙字關鍵字', () => {
    searchRoads6('三元')
  })

  bench('searchRoads6 - 限定縣市', () => {
    searchRoads6('中山', '臺北市')
  })

  bench('searchRoads6 - 限定縣市和行政區', () => {
    searchRoads6('中山', '臺北市', '中山區')
  })
})

describe('6 碼郵遞區號 - 驗證效能', () => {
  bench('isValidZipCode6 - 有效', () => {
    isValidZipCode6('100053')
  })

  bench('isValidZipCode6 - 無效格式', () => {
    isValidZipCode6('abc')
  })

  bench('isValidZipCode6 - 無效區號', () => {
    isValidZipCode6('999999')
  })
})

describe('初始化效能', () => {
  bench('首次 getZipCode（觸發索引建立）', () => {
    // 注意：快取建立後，後續調用為 O(1)
    getZipCode('中正區')
  })

  bench('首次 isValidZipCode6（觸發快取建立）', () => {
    // 注意：快取建立後，後續調用為 O(1)
    isValidZipCode6('100053')
  })
})
