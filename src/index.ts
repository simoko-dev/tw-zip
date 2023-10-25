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
 * getData()
 * // { "台北市": { "中正區": "100", "大同區": "103", "中山區": "104", "松山區": "105", ... }, "基隆市": { "仁愛區": "200", "信義區": "201", "中正區": "202", ... }, ... }
 */
function getData(): ICity {
  return data
}

/**
 * 回傳縣市陣列
 * @example
 * getCityArray()
 * // [ "台北市", "基隆市", "新北市", ... ]
 */
function getCityArray(): string[] {
  return Object.keys(data)
}

/**
 * 回傳行政區資料 - dist
 * @param city 縣市名稱
 * @example
 * getDistricts("台北市")
 * // { "中正區": "100", "大同區": "103", ... }
 */
function getDistricts(city?: string): IDistrict {
  return Object.entries(data).filter(x => city ? x[0] === city : true).flatMap(([, v1]) => v1).reduce((t, r) => Object.assign({ ...t, ...r }))
}

/**
 * 回傳行政區資料 - array
 * @param city 縣市名稱
 * @param label 標籤名稱 (可選，預設 `label`)
 * @param value 值名稱 (可選，預設 `value`)
 * @example
 * getDistrictArray("台北市", { label: "key" })
 * // [ { key: "中正區", value: "100" }, { key: "大同區", value: "103" }, ... ]
 */
function getDistrictArray(city: string | null = null, { label = 'label', value = 'value' } = {}): { [key: string]: string }[] {
  return Object.entries(getDistricts(city || undefined)).map(([k, v]) => ({ [label]: k, [value]: v }))
}

/**
 * 回傳扁平化陣列資訊
 * @param city 縣市名稱 (可選，預設回傳所有縣市)
 * @param symbol 分隔符號 (可選，預設為 `空格符`)
 * @example
 * getFlatArray("台北市")
 * // [ "100 台北市 中正區", "103 台北市 大同區", ... ]
 *
 * getFlatArray({ city: '嘉義市', symbol: '#' })
 * // [ "600#嘉義市#東區", "600#嘉義市#西區" ]
*/
function getFlatArray({ city = '', symbol = ' ' } = {}): string[] {
  return Object.entries(data).filter(x => city ? x[0] === city : true).flatMap(([k1, v1]) => Object.entries(v1).flatMap(([k2, v2]) => `${v2}${symbol}${k1}${symbol}${k2}`))
}

/**
 * 根據行政區回傳郵遞區號
 * @param district 行政區名稱
 * @example
 * getZipCode("中正區")
 * // [ "100", "台北市", "中正區" ]
 */
function getZipCode(district: string) {
  return getFlatArray().find(x => x.endsWith(district))?.split(' ')
}

export { getData, getCityArray, getDistricts, getDistrictArray, getFlatArray, getZipCode }
export type { ICity, IDistrict }
