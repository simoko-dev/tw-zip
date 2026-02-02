# Vue Composables

Vue 3 Composition API，支援 3 碼與 6 碼郵遞區號。

## useTwZip (3 碼)

縣市、行政區選擇器。

```vue
<script setup>
import { useTwZip } from '@simoko/tw-zip/vue'

const {
  cities,    // 縣市列表
  districts, // 行政區列表 [{ label, value }]
  city,      // 選中縣市（ref）
  district,  // 選中行政區（computed）
  zipCode,   // 郵遞區號（ref）
} = useTwZip()
</script>

<template>
  <select v-model="city">
    <option v-for="c in cities" :key="c">{{ c }}</option>
  </select>

  <select v-model="district">
    <option v-for="d in districts" :key="d.label">{{ d.label }}</option>
  </select>

  <p>郵遞區號：{{ zipCode }}</p>
</template>
```

### 回傳值

| 名稱 | 型別 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表 |
| `districts` | `Ref<{ label: string, value: string }[]>` | 行政區列表 |
| `city` | `Ref<string>` | 選中縣市 |
| `district` | `WritableComputedRef<string>` | 選中行政區 |
| `zipCode` | `Ref<string>` | 郵遞區號 |

## useTwZip6 (6 碼)

街道層級精確查詢。

```vue
<script setup>
import { useTwZip6 } from '@simoko/tw-zip/vue'

const {
  // 選項列表
  cities, areas, roads,

  // 選中值（ref）
  city, area, road, number, lane, alley,

  // 路名搜尋
  searchRoads, searchResults,

  // 結果（computed）
  zipCode, zip3, result,
} = useTwZip6()
</script>

<template>
  <select v-model="city">
    <option v-for="c in cities" :key="c">{{ c }}</option>
  </select>

  <select v-model="area">
    <option v-for="a in areas" :key="a">{{ a }}</option>
  </select>

  <select v-model="road">
    <option v-for="r in roads" :key="r">{{ r }}</option>
  </select>

  <input v-model.number="number" type="number" placeholder="門牌" />

  <p>郵遞區號：{{ zipCode }}</p>
</template>
```

### 路名搜尋

```vue
<script setup>
import { ref } from 'vue'
import { useTwZip6 } from '@simoko/tw-zip/vue'

const { city, area, road, searchRoads, searchResults } = useTwZip6()
const keyword = ref('')

function handleSearch() {
  searchRoads(keyword.value)
}

function selectResult(result) {
  city.value = result.city
  area.value = result.area
  road.value = result.road
}
</script>

<template>
  <input v-model="keyword" @input="handleSearch" placeholder="搜尋路名" />
  <ul>
    <li v-for="(r, i) in searchResults" :key="i" @click="selectResult(r)">
      {{ r.city }} {{ r.area }} {{ r.road }}
    </li>
  </ul>
</template>
```

### 回傳值

| 名稱 | 型別 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表 |
| `areas` | `Ref<string[]>` | 行政區列表 |
| `roads` | `Ref<string[]>` | 路名列表 |
| `city` | `Ref<string>` | 選中縣市 |
| `area` | `Ref<string>` | 選中行政區 |
| `road` | `Ref<string>` | 選中路名 |
| `number` | `Ref<number \| undefined>` | 門牌號碼 |
| `lane` | `Ref<number \| undefined>` | 巷 |
| `alley` | `Ref<number \| undefined>` | 弄 |
| `searchRoads` | `(keyword: string) => void` | 搜尋路名 |
| `searchResults` | `Ref<SearchResult[]>` | 搜尋結果 |
| `zipCode` | `ComputedRef<string>` | 6 碼郵遞區號 |
| `zip3` | `ComputedRef<string>` | 3 碼郵遞區號 |
| `result` | `ComputedRef<Zip6Result \| undefined>` | 完整查詢結果 |

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
