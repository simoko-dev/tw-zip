# 6 碼 API

6 碼郵遞區號（3+3 格式）街道層級精確查詢。

> 自 2020/3/3 起，中華郵政推出 6 碼郵遞區號，提供街道層級的精確投遞。

## 查詢函數

### getCities6

取得所有有 6 碼資料的縣市。

```typescript
import { getCities6 } from '@simoko/tw-zip/zip6'

getCities6()
// ['臺北市', '基隆市', '新北市', ...]
```

### getAreas6

取得指定縣市的行政區。

```typescript
import { getAreas6 } from '@simoko/tw-zip/zip6'

getAreas6('臺北市')
// ['中正區', '大同區', '中山區', ...]
```

### getRoads6

取得指定行政區的路名。

```typescript
import { getRoads6 } from '@simoko/tw-zip/zip6'

getRoads6('臺北市', '中正區')
// ['三元街', '中山北路一段', '中山南路', ...]
```

### getZipCode6

查詢 6 碼郵遞區號。

```typescript
import { getZipCode6 } from '@simoko/tw-zip/zip6'

getZipCode6({
  city: '臺北市',
  area: '中正區',
  road: '三元街',
  number: 145
})
// { zipcode: '100060', zip3: '100', city: '臺北市', area: '中正區', road: '三元街' }

// 含巷弄
getZipCode6({
  city: '臺北市',
  area: '中正區',
  road: '汀州路三段',
  lane: 230,
  alley: 5,
  number: 10
})
```

### getZipCodes6ByRoad

取得路名的所有 6 碼郵遞區號。

```typescript
import { getZipCodes6ByRoad } from '@simoko/tw-zip/zip6'

getZipCodes6ByRoad('臺北市', '中正區', '三元街')
// ['100053', '100060']
```

### searchRoads6

搜尋路名。

```typescript
import { searchRoads6 } from '@simoko/tw-zip/zip6'

// 全域搜尋
searchRoads6('忠孝東路')
// [{ city: '臺北市', area: '大安區', road: '忠孝東路四段' }, ...]

// 限定縣市
searchRoads6('忠孝東路', '臺北市')

// 限定行政區
searchRoads6('忠孝東路', '臺北市', '大安區')
```

### isValidZipCode6

驗證 6 碼郵遞區號。

```typescript
import { isValidZipCode6 } from '@simoko/tw-zip/zip6'

isValidZipCode6('100060')  // true
isValidZipCode6('999999')  // false
```

## 型別

```typescript
interface AddressQuery {
  city: string      // 縣市（必填）
  area: string      // 行政區（必填）
  road: string      // 路名（必填）
  number?: number   // 門牌號碼
  lane?: number     // 巷
  alley?: number    // 弄
}

interface Zip6Result {
  zipcode: string   // 6 碼郵遞區號
  zip3: string      // 3 碼郵遞區號
  city: string      // 縣市
  area: string      // 行政區
  road: string      // 路名
}
```

## 注意事項

- 6 碼模組資料量約 1.7MB
- 建議使用動態 import 或 [Lazy Load 版本](lazy.md) 減少初始載入大小
- 如果 6 碼是核心功能，直接 import 即可
