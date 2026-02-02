import rawData from './data'

interface IDistrict {
  [key: string]: string
}

interface ICity {
  [key: string]: IDistrict
}

const data: ICity = rawData

type ZipCodeResult = [string, string, string]

// 快取
let zipCodeIndex: Map<string, ZipCodeResult[]> | null = null
let districtIndex: Map<string, ZipCodeResult[]> | null = null
let cachedCityArray: string[] | null = null
let cachedAllDistricts: IDistrict | null = null

function buildIndexes(): void {
  if (zipCodeIndex)
    return
  zipCodeIndex = new Map()
  districtIndex = new Map()
  for (const [city, districts] of Object.entries(data)) {
    for (const [district, zip] of Object.entries(districts)) {
      const tuple: ZipCodeResult = [zip, city, district]
      // 支援一對多映射：同一郵遞區號可對應多個行政區
      const zipResults = zipCodeIndex.get(zip)
      if (zipResults) {
        zipResults.push(tuple)
      }
      else {
        zipCodeIndex.set(zip, [tuple])
      }
      // 支援一對多映射：同名行政區可存在於不同縣市
      const districtResults = districtIndex.get(district)
      if (districtResults) {
        districtResults.push(tuple)
      }
      else {
        districtIndex.set(district, [tuple])
      }
    }
  }
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
  if (!cachedCityArray)
    cachedCityArray = Object.keys(data)
  return cachedCityArray
}

/**
 * 回傳行政區資料 - dist
 * @param city 縣市名稱
 * @example
 * getDistricts("台北市")
 * // { "中正區": "100", "大同區": "103", ... }
 */
function getDistricts(city?: string): IDistrict {
  if (city)
    return data[city] || {}
  if (!cachedAllDistricts)
    cachedAllDistricts = Object.values(data).reduce<IDistrict>((acc, districts) => Object.assign(acc, districts), {})
  return cachedAllDistricts
}

/**
 * 回傳行政區資料 - array
 * @param city 縣市名稱
 * @param options 選項
 * @param options.label 標籤鍵名 (預設 `label`)
 * @param options.value 值鍵名 (預設 `value`)
 * @example
 * getDistrictArray("台北市", { label: "key" })
 * // [ { key: "中正區", value: "100" }, { key: "大同區", value: "103" }, ... ]
 */
function getDistrictArray(city: string | null = null, { label = 'label', value = 'value' }: { label?: string, value?: string } = {}): { [key: string]: string }[] {
  return Object.entries(getDistricts(city || undefined)).map(([k, v]) => ({ [label]: k, [value]: v }))
}

/**
 * 回傳扁平化陣列資訊
 * @param options 選項
 * @param options.city 縣市名稱 (預設回傳所有縣市)
 * @param options.symbol 分隔符號 (預設為 `空格符`)
 * @example
 * getFlatArray("台北市")
 * // [ "100 台北市 中正區", "103 台北市 大同區", ... ]
 *
 * getFlatArray({ city: '嘉義市', symbol: '#' })
 * // [ "600#嘉義市#東區", "600#嘉義市#西區" ]
 */
function getFlatArray({ city = '', symbol = ' ' }: { city?: string, symbol?: string } = {}): string[] {
  return Object.entries(data).filter(x => city ? x[0] === city : true).flatMap(([k1, v1]) => Object.entries(v1).flatMap(([k2, v2]) => `${v2}${symbol}${k1}${symbol}${k2}`))
}

/**
 * 根據行政區或郵遞區號回傳單筆資料（若有多筆則回傳第一筆）
 * @param input 行政區名稱或郵遞區號
 * @description 注意：同名行政區（如「中正區」）或共用郵遞區號（如「300」）會有多筆結果，
 * 此函數僅回傳第一筆。若需精確查詢，請使用 `getZipCodeByCity` 或 `searchDistricts`。
 * @example
 * getZipCode("中正區")
 * // [ "100", "台北市", "中正區" ]
 * getZipCode("100")
 * // [ "100", "台北市", "中正區" ]
 */
function getZipCode(input: string): ZipCodeResult | undefined {
  buildIndexes()
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) {
    return zipCodeIndex!.get(trimmed)?.[0]
  }
  return districtIndex!.get(trimmed)?.[0]
}

/**
 * 根據行政區或郵遞區號回傳所有匹配的資料
 * @param input 行政區名稱或郵遞區號
 * @example
 * getZipCodeAll("中正區")
 * // [ ["100", "台北市", "中正區"], ["202", "基隆市", "中正區"] ]
 * getZipCodeAll("300")
 * // [ ["300", "新竹市", "東區"], ["300", "新竹市", "北區"], ["300", "新竹市", "香山區"] ]
 */
function getZipCodeAll(input: string): ZipCodeResult[] {
  buildIndexes()
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) {
    return zipCodeIndex!.get(trimmed) || []
  }
  return districtIndex!.get(trimmed) || []
}

/**
 * 根據縣市和行政區回傳郵遞區號資料（解決同名行政區問題）
 * @param city 縣市名稱
 * @param district 行政區名稱
 * @example
 * getZipCodeByCity("基隆市", "中正區")
 * // [ "202", "基隆市", "中正區" ]
 * getZipCodeByCity("台北市", "中正區")
 * // [ "100", "台北市", "中正區" ]
 */
function getZipCodeByCity(city: string, district: string): ZipCodeResult | undefined {
  const cityData = data[city.trim()]
  if (!cityData)
    return undefined
  const zip = cityData[district.trim()]
  if (!zip)
    return undefined
  return [zip, city.trim(), district.trim()]
}

/**
 * 模糊搜尋行政區（支援同名行政區）
 * @param keyword 搜尋關鍵字
 * @example
 * searchDistricts("中正")
 * // [ ["100", "台北市", "中正區"], ["202", "基隆市", "中正區"] ]
 * searchDistricts("大安")
 * // [ ["106", "台北市", "大安區"], ["439", "台中市", "大安區"] ]
 */
function searchDistricts(keyword: string): ZipCodeResult[] {
  const results: ZipCodeResult[] = []
  const trimmed = keyword.trim()
  if (!trimmed)
    return results
  for (const [city, districts] of Object.entries(data)) {
    for (const [district, zip] of Object.entries(districts)) {
      if (district.includes(trimmed) || city.includes(trimmed)) {
        results.push([zip, city, district])
      }
    }
  }
  return results
}

/**
 * 驗證縣市名稱是否有效
 * @param city 縣市名稱
 * @example
 * isValidCity("台北市") // true
 * isValidCity("東京都") // false
 */
function isValidCity(city: string): boolean {
  return city.trim() in data
}

/**
 * 驗證行政區名稱是否有效
 * @param district 行政區名稱
 * @param city 縣市名稱（可選，若指定則只在該縣市內驗證）
 * @example
 * isValidDistrict("中正區") // true
 * isValidDistrict("中正區", "台北市") // true
 * isValidDistrict("中正區", "高雄市") // false
 */
function isValidDistrict(district: string, city?: string): boolean {
  const trimmedDistrict = district.trim()
  if (city) {
    const cityData = data[city.trim()]
    return cityData ? trimmedDistrict in cityData : false
  }
  buildIndexes()
  return districtIndex!.has(trimmedDistrict)
}

/**
 * 驗證郵遞區號是否有效
 * @param zipCode 郵遞區號
 * @example
 * isValidZipCode("100") // true
 * isValidZipCode("999") // false
 */
function isValidZipCode(zipCode: string): boolean {
  buildIndexes()
  return zipCodeIndex!.has(zipCode.trim())
}

export {
  getCityArray,
  getData,
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
}
export type { ICity, IDistrict, ZipCodeResult }
