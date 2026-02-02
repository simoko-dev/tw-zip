# Svelte Stores

使用 Svelte stores 的響應式郵遞區號查詢。

## 安裝

```bash
npm install @simoko/tw-zip svelte
```

## 3 碼查詢 - createTwZip

```svelte
<script>
import { createTwZip } from '@simoko/tw-zip/svelte'

const { cities, city, districts, district, zipCode, setCity, setDistrict } = createTwZip()
</script>

<select bind:value={$city} on:change={e => setCity(e.target.value)}>
  {#each $cities as c}
    <option value={c}>{c}</option>
  {/each}
</select>

<select on:change={e => setDistrict(e.target.value)}>
  {#each $districts as d}
    <option value={d.label} selected={d.label === $district}>{d.label}</option>
  {/each}
</select>

<p>郵遞區號：{$zipCode}</p>
```

### 回傳值

| 名稱 | 類型 | 說明 |
|------|------|------|
| `cities` | `Readable<string[]>` | 縣市列表 |
| `city` | `Writable<string>` | 目前選中縣市 |
| `districts` | `Writable<{label, value}[]>` | 行政區列表 |
| `district` | `Derived<string>` | 目前選中行政區 |
| `zipCode` | `Writable<string>` | 郵遞區號 |
| `setCity` | `(value: string) => void` | 設定縣市 |
| `setDistrict` | `(value: string) => void` | 設定行政區 |
| `setZipCode` | `(value: string) => void` | 設定郵遞區號 |

## 6 碼查詢 - createTwZip6

```svelte
<script>
import { createTwZip6 } from '@simoko/tw-zip/svelte'

const {
  cities, areas, roads,
  city, area, road, number,
  setCity, setArea, setRoad, setNumber,
  zipCode, zip3
} = createTwZip6()
</script>

<select on:change={e => setCity(e.target.value)}>
  {#each $cities as c}
    <option value={c} selected={c === $city}>{c}</option>
  {/each}
</select>

<select on:change={e => setArea(e.target.value)}>
  {#each $areas as a}
    <option value={a} selected={a === $area}>{a}</option>
  {/each}
</select>

<select on:change={e => setRoad(e.target.value)}>
  {#each $roads as r}
    <option value={r} selected={r === $road}>{r}</option>
  {/each}
</select>

<input type="number" on:input={e => setNumber(parseInt(e.target.value) || undefined)} placeholder="門牌號碼" />

<p>郵遞區號：{$zipCode}（3碼：{$zip3}）</p>
```

### 回傳值

| 名稱 | 類型 | 說明 |
|------|------|------|
| `cities` | `Readable<string[]>` | 縣市列表 |
| `areas` | `Writable<string[]>` | 行政區列表 |
| `roads` | `Writable<string[]>` | 路名列表 |
| `city` | `Writable<string>` | 目前縣市 |
| `area` | `Writable<string>` | 目前行政區 |
| `road` | `Writable<string>` | 目前路名 |
| `number` | `Writable<number \| undefined>` | 門牌號碼 |
| `lane` | `Writable<number \| undefined>` | 巷 |
| `alley` | `Writable<number \| undefined>` | 弄 |
| `zipCode` | `Derived<string>` | 6 碼郵遞區號 |
| `zip3` | `Derived<string>` | 3 碼郵遞區號 |
| `searchRoads` | `(keyword: string) => void` | 搜尋路名 |
| `searchResults` | `Writable<SearchResult[]>` | 搜尋結果 |

## Lazy Loading

6 碼資料約 1.7MB，可使用 Lazy Loading 版本按需載入：

```svelte
<script>
import { createTwZip6 } from '@simoko/tw-zip/svelte/lazy'

const { loading, cities, city, setCity, zipCode } = createTwZip6()
</script>

{#if $loading}
  <p>載入中...</p>
{:else}
  <select on:change={e => setCity(e.target.value)}>
    {#each $cities as c}
      <option value={c} selected={c === $city}>{c}</option>
    {/each}
  </select>
  <p>郵遞區號：{$zipCode}</p>
{/if}
```
