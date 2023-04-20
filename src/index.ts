import data from './data'

interface IDistrict {
  [key: string]: string
}

interface ICity {
  [key: string]: IDistrict
}

/**
 * 回傳所有資料
 * @example
 * {
 *   "台北市": {
 *     "中正區": "100",
 *     "大同區": "103",
 *     ...
 *   },
 *   "基隆市": {
 *     "仁愛區": "200",
 *     "信義區": "201",
 *     ...
 *   },
 *   "新北市": {
 *     "萬里區": "207",
 *     "金山區": "208",
 *     ...
 *   },
 *   ...
 * }
 */
function getData(): ICity {
  return data
}

/**
 * 回傳縣市陣列
 * @example ['台北市', '基隆市', '新北市', ...]
 */
function getCityArray(): string[] {
  return Object.keys(data)
}

/**
 * 回傳行政區資料
 * @param city 縣市名稱
 * @example { "中正區": "100", "大同區": "103", ... }
*/
function getDistricts(city: string): IDistrict {
  return Object.entries(data).filter(x => x[0] === city).flatMap(([k1, v1]) => v1)[0] || ({} as IDistrict)
}

/**
 * 回傳扁平化陣列資訊
 * @param city 縣市名稱 (可選，預設回傳所有縣市)
 * @param symbol 分隔符號 (可選，預設為`空格符`)
 * @example
 * getFlatArray({ city: '嘉義市', symbol: '#' })
 * // return [ '600#嘉義市#東區', '600#嘉義市#西區' ]
 * @example
 * getFlatArray()
 * // return ['100 台北市 中正區', '103 台北市 大同區', ...]
*/
function getFlatArray({ city = '', symbol = ' ' } = {}): string[] {
  return Object.entries(data).filter(x => city ? x[0] === city : true).flatMap(([k1, v1]) => Object.entries(v1).flatMap(([k2, v2]) => `${v2}${symbol}${k1}${symbol}${k2}`))
}

/**
 * 根據行政區回傳郵遞區號
 * @param district 行政區名稱
 * @example
 * getZipCode('中正區')
 * // return ['100', '台北市', '中正區']
 */
function getZipCode(district: string) {
  return getFlatArray().find(x => x.endsWith(district))?.split(' ')
}

export default { getData, getCityArray, getDistricts, getFlatArray, getZipCode }
