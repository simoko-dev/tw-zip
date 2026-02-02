# SolidJS Hooks

使用 SolidJS signals 的響應式郵遞區號查詢。

## 安裝

```bash
npm install @simoko/tw-zip solid-js
```

## 3 碼查詢 - useTwZip

```tsx
import { useTwZip } from '@simoko/tw-zip/solidjs'

function App() {
  const { cities, city, setCity, districts, district, setDistrict, zipCode } = useTwZip()

  return (
    <>
      <select value={city()} onChange={e => setCity(e.target.value)}>
        <For each={cities}>{c => <option value={c}>{c}</option>}</For>
      </select>

      <select value={district()} onChange={e => setDistrict(e.target.value)}>
        <For each={districts()}>{d => <option value={d.label}>{d.label}</option>}</For>
      </select>

      <p>郵遞區號：{zipCode()}</p>
    </>
  )
}
```

### 回傳值

| 名稱 | 類型 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表（靜態） |
| `city` | `Accessor<string>` | 目前選中縣市 |
| `districts` | `Accessor<{label, value}[]>` | 行政區列表 |
| `district` | `Accessor<string>` | 目前選中行政區 |
| `zipCode` | `Accessor<string>` | 郵遞區號 |
| `setCity` | `(value: string) => void` | 設定縣市 |
| `setDistrict` | `(value: string) => void` | 設定行政區 |
| `setZipCode` | `(value: string) => void` | 設定郵遞區號 |

## 6 碼查詢 - useTwZip6

```tsx
import { useTwZip6 } from '@simoko/tw-zip/solidjs'

function App() {
  const {
    cities, areas, roads,
    city, area, road, number,
    setCity, setArea, setRoad, setNumber,
    zipCode, zip3
  } = useTwZip6()

  return (
    <>
      <select value={city()} onChange={e => setCity(e.target.value)}>
        <For each={cities}>{c => <option value={c}>{c}</option>}</For>
      </select>

      <select value={area()} onChange={e => setArea(e.target.value)}>
        <For each={areas()}>{a => <option value={a}>{a}</option>}</For>
      </select>

      <select value={road()} onChange={e => setRoad(e.target.value)}>
        <For each={roads()}>{r => <option value={r}>{r}</option>}</For>
      </select>

      <input
        type="number"
        value={number() ?? ''}
        onInput={e => setNumber(parseInt(e.target.value) || undefined)}
        placeholder="門牌號碼"
      />

      <p>郵遞區號：{zipCode()}（3碼：{zip3()}）</p>
    </>
  )
}
```

### 回傳值

| 名稱 | 類型 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表（靜態） |
| `areas` | `Accessor<string[]>` | 行政區列表 |
| `roads` | `Accessor<string[]>` | 路名列表 |
| `city` | `Accessor<string>` | 目前縣市 |
| `area` | `Accessor<string>` | 目前行政區 |
| `road` | `Accessor<string>` | 目前路名 |
| `number` | `Accessor<number \| undefined>` | 門牌號碼 |
| `lane` | `Accessor<number \| undefined>` | 巷 |
| `alley` | `Accessor<number \| undefined>` | 弄 |
| `zipCode` | `Accessor<string>` | 6 碼郵遞區號 |
| `zip3` | `Accessor<string>` | 3 碼郵遞區號 |
| `searchRoads` | `(keyword: string) => void` | 搜尋路名 |
| `searchResults` | `Accessor<SearchResult[]>` | 搜尋結果 |

## Lazy Loading

6 碼資料約 1.7MB，可使用 Lazy Loading 版本按需載入：

```tsx
import { useTwZip6 } from '@simoko/tw-zip/solidjs/lazy'

function App() {
  const { loading, cities, city, setCity, zipCode } = useTwZip6()

  return (
    <Show when={!loading()} fallback={<p>載入中...</p>}>
      <select value={city()} onChange={e => setCity(e.target.value)}>
        <For each={cities()}>{c => <option value={c}>{c}</option>}</For>
      </select>
      <p>郵遞區號：{zipCode()}</p>
    </Show>
  )
}
```
