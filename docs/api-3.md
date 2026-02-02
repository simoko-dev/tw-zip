# 3 碼 API

3 碼郵遞區號（縣市、行政區層級）查詢。

## 查詢函數

### getCityArray

取得所有縣市。

```typescript
import { getCityArray } from '@simoko/tw-zip'

getCityArray()
// ['台北市', '基隆市', '新北市', ...]
```

### getDistricts

取得行政區（物件格式）。

```typescript
import { getDistricts } from '@simoko/tw-zip'

// 指定縣市
getDistricts('台北市')
// { '中正區': '100', '大同區': '103', ... }

// 所有行政區
getDistricts()
// { '中正區': '100', '大同區': '103', ..., '馬公市': '880', ... }
```

### getDistrictArray

取得行政區（陣列格式），可自訂鍵名。

```typescript
import { getDistrictArray } from '@simoko/tw-zip'

getDistrictArray('台北市')
// [{ label: '中正區', value: '100' }, ...]

// 自訂鍵名
getDistrictArray('台北市', { label: 'name', value: 'zip' })
// [{ name: '中正區', zip: '100' }, ...]
```

### getZipCode

依行政區名稱或郵遞區號查詢。

```typescript
import { getZipCode } from '@simoko/tw-zip'

getZipCode('三民區')   // ['807', '高雄市', '三民區']
getZipCode('807')     // ['807', '高雄市', '三民區']
getZipCode('不存在')   // undefined
```

### getZipCodeByCity

依縣市 + 行政區查詢（解決同名行政區問題）。

```typescript
import { getZipCodeByCity } from '@simoko/tw-zip'

getZipCodeByCity('台北市', '中正區')  // ['100', '台北市', '中正區']
getZipCodeByCity('基隆市', '中正區')  // ['202', '基隆市', '中正區']
```

### searchDistricts

模糊搜尋行政區。

```typescript
import { searchDistricts } from '@simoko/tw-zip'

searchDistricts('中正')
// [['100', '台北市', '中正區'], ['202', '基隆市', '中正區']]

searchDistricts('大安')
// [['106', '台北市', '大安區'], ['439', '台中市', '大安區']]
```

### getFlatArray

取得扁平化陣列。

```typescript
import { getFlatArray } from '@simoko/tw-zip'

getFlatArray({ city: '嘉義市' })
// ['600 嘉義市 東區', '600 嘉義市 西區']

getFlatArray({ city: '嘉義市', symbol: ',' })
// ['600,嘉義市,東區', '600,嘉義市,西區']
```

### getData

取得完整原始資料。

```typescript
import { getData } from '@simoko/tw-zip'

getData()
// { '台北市': { '中正區': '100', ... }, ... }
```

## 驗證函數

### isValidCity

```typescript
import { isValidCity } from '@simoko/tw-zip'

isValidCity('台北市')  // true
isValidCity('東京都')  // false
```

### isValidDistrict

```typescript
import { isValidDistrict } from '@simoko/tw-zip'

isValidDistrict('中正區')            // true（任一縣市有此區即可）
isValidDistrict('中正區', '台北市')  // true
isValidDistrict('中正區', '高雄市')  // false（高雄市沒有中正區）
```

### isValidZipCode

```typescript
import { isValidZipCode } from '@simoko/tw-zip'

isValidZipCode('100')  // true
isValidZipCode('999')  // false
```

## 型別

```typescript
interface IDistrict {
  [district: string]: string  // 行政區: 郵遞區號
}

interface ICity {
  [city: string]: IDistrict   // 縣市: 行政區資料
}

type ZipCodeResult = [string, string, string]  // [郵遞區號, 縣市, 行政區]
```
