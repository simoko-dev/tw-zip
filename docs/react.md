# React Hooks

React 專用 hooks，支援 3 碼與 6 碼郵遞區號。

## useTwZip (3 碼)

縣市、行政區選擇器。

```tsx
import { useTwZip } from '@simoko/tw-zip/react'

function AddressForm() {
  const {
    cities,      // 縣市列表
    districts,   // 行政區列表 [{ label, value }]
    city,        // 選中縣市
    setCity,     // 設定縣市
    district,    // 選中行政區
    setDistrict, // 設定行政區（依名稱）
    zipCode,     // 郵遞區號
    setZipCode,  // 設定郵遞區號（自動更新行政區）
  } = useTwZip()

  return (
    <>
      <select value={city} onChange={e => setCity(e.target.value)}>
        {cities.map(c => <option key={c}>{c}</option>)}
      </select>

      <select value={district} onChange={e => setDistrict(e.target.value)}>
        {districts.map(d => <option key={d.label}>{d.label}</option>)}
      </select>

      <input value={zipCode} readOnly />
    </>
  )
}
```

### 回傳值

| 名稱 | 型別 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表 |
| `districts` | `{ label: string, value: string }[]` | 行政區列表 |
| `city` | `string` | 選中縣市 |
| `setCity` | `(city: string) => void` | 設定縣市 |
| `district` | `string` | 選中行政區 |
| `setDistrict` | `(district: string) => void` | 設定行政區 |
| `zipCode` | `string` | 郵遞區號 |
| `setZipCode` | `(zipCode: string) => void` | 設定郵遞區號 |

## useTwZip6 (6 碼)

街道層級精確查詢。

```tsx
import { useTwZip6 } from '@simoko/tw-zip/react'

function AddressForm6() {
  const {
    // 選項列表
    cities, areas, roads,

    // 選中值
    city, area, road, number, lane, alley,

    // Setters
    setCity, setArea, setRoad, setNumber, setLane, setAlley,

    // 路名搜尋
    searchRoads, searchResults,

    // 結果
    zipCode, zip3, result,
  } = useTwZip6()

  return (
    <>
      <select value={city} onChange={e => setCity(e.target.value)}>
        {cities.map(c => <option key={c}>{c}</option>)}
      </select>

      <select value={area} onChange={e => setArea(e.target.value)}>
        {areas.map(a => <option key={a}>{a}</option>)}
      </select>

      <select value={road} onChange={e => setRoad(e.target.value)}>
        {roads.map(r => <option key={r}>{r}</option>)}
      </select>

      <input
        type="number"
        placeholder="門牌"
        value={number ?? ''}
        onChange={e => setNumber(e.target.value ? Number(e.target.value) : undefined)}
      />

      <p>郵遞區號：{zipCode}</p>
    </>
  )
}
```

### 路名搜尋

```tsx
function RoadSearch() {
  const { searchRoads, searchResults, setCity, setArea, setRoad } = useTwZip6()
  const [keyword, setKeyword] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setKeyword(value)
    searchRoads(value)
  }

  const handleSelect = (result: SearchResult) => {
    setCity(result.city)
    setArea(result.area)
    setRoad(result.road)
  }

  return (
    <>
      <input value={keyword} onChange={handleSearch} placeholder="搜尋路名" />
      <ul>
        {searchResults.map((r, i) => (
          <li key={i} onClick={() => handleSelect(r)}>
            {r.city} {r.area} {r.road}
          </li>
        ))}
      </ul>
    </>
  )
}
```

### 回傳值

| 名稱 | 型別 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表 |
| `areas` | `string[]` | 行政區列表 |
| `roads` | `string[]` | 路名列表 |
| `city` | `string` | 選中縣市 |
| `area` | `string` | 選中行政區 |
| `road` | `string` | 選中路名 |
| `number` | `number \| undefined` | 門牌號碼 |
| `lane` | `number \| undefined` | 巷 |
| `alley` | `number \| undefined` | 弄 |
| `setCity` | `(city: string) => void` | 設定縣市 |
| `setArea` | `(area: string) => void` | 設定行政區 |
| `setRoad` | `(road: string) => void` | 設定路名 |
| `setNumber` | `(n: number \| undefined) => void` | 設定門牌 |
| `setLane` | `(n: number \| undefined) => void` | 設定巷 |
| `setAlley` | `(n: number \| undefined) => void` | 設定弄 |
| `searchRoads` | `(keyword: string) => void` | 搜尋路名 |
| `searchResults` | `SearchResult[]` | 搜尋結果 |
| `zipCode` | `string` | 6 碼郵遞區號 |
| `zip3` | `string` | 3 碼郵遞區號 |
| `result` | `Zip6Result \| undefined` | 完整查詢結果 |

## 型別

```typescript
interface SearchResult {
  city: string
  area: string
  road: string
}

interface Zip6Result {
  zipcode: string  // 6 碼郵遞區號
  zip3: string     // 3 碼郵遞區號
  city: string
  area: string
  road: string
}
```

## Lazy Load 版本

如需按縣市動態載入資料，請參考 [Lazy Load](lazy.md)。
