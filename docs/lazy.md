# Lazy Load

6 碼郵遞區號資料約 1.7MB，Lazy Load 版本按縣市動態載入，初始載入僅約 5KB。

## 使用方式

```typescript
// 預設 - Bundled（完整資料）
import { useTwZip6 } from '@simoko/tw-zip/react'
import { useTwZip6 } from '@simoko/tw-zip/vue'

// Lazy - 按縣市動態載入
import { useTwZip6 } from '@simoko/tw-zip/react/lazy'
import { useTwZip6 } from '@simoko/tw-zip/vue/lazy'
```

## React

```tsx
import { useTwZip6 } from '@simoko/tw-zip/react/lazy'

function AddressForm() {
  const {
    loading,  // 載入狀態
    cities, areas, roads,
    city, area, road, number,
    setCity, setArea, setRoad, setNumber,
    zipCode,
  } = useTwZip6()

  if (loading) return <div>載入中...</div>

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
        value={number ?? ''}
        onChange={e => setNumber(e.target.value ? Number(e.target.value) : undefined)}
      />

      <p>郵遞區號：{zipCode}</p>
    </>
  )
}
```

## Vue

```vue
<script setup>
import { useTwZip6 } from '@simoko/tw-zip/vue/lazy'

const {
  loading,
  cities, areas, roads,
  city, area, road, number,
  setCity, setArea, setRoad,
  zipCode,
} = useTwZip6()
</script>

<template>
  <div v-if="loading">載入中...</div>
  <template v-else>
    <select :value="city" @change="setCity($event.target.value)">
      <option v-for="c in cities" :key="c">{{ c }}</option>
    </select>

    <select :value="area" @change="setArea($event.target.value)">
      <option v-for="a in areas" :key="a">{{ a }}</option>
    </select>

    <select :value="road" @change="setRoad($event.target.value)">
      <option v-for="r in roads" :key="r">{{ r }}</option>
    </select>

    <input v-model.number="number" type="number" />

    <p>郵遞區號：{{ zipCode }}</p>
  </template>
</template>
```

## 選項

```typescript
const hook = useTwZip6({
  // 自訂資料來源（預設使用 jsDelivr CDN）
  baseUrl: 'https://your-cdn.com/data/zip6',

  // 預載入特定縣市
  preload: ['臺北市', '新北市'],
})
```

### baseUrl

預設從 jsDelivr CDN 載入：
```
https://cdn.jsdelivr.net/npm/@simoko/tw-zip@latest/data/zip6/
```

可自訂為其他 CDN 或自架伺服器。

### preload

預載入指定縣市資料，適合預先載入常用縣市。

## 額外功能

Lazy 版本提供額外工具函數：

```typescript
const {
  // ...其他

  // 預載入縣市
  preloadCities,

  // 檢查縣市是否已快取
  isCityCached,

  // 清除快取
  clearCache,
} = useTwZip6()

// 預載入多個縣市
await preloadCities(['高雄市', '台中市'])

// 檢查是否已快取
if (isCityCached('臺北市')) {
  console.log('臺北市資料已載入')
}

// 清除所有快取
clearCache()
```

## 回傳值

除了標準 useTwZip6 的回傳值外，Lazy 版本額外提供：

| 名稱 | 型別 | 說明 |
|------|------|------|
| `loading` | `boolean` | 是否正在載入資料 |
| `preloadCities` | `(cities: string[]) => Promise<void>` | 預載入縣市 |
| `isCityCached` | `(city: string) => boolean` | 檢查是否已快取 |
| `clearCache` | `() => void` | 清除所有快取 |

## 何時使用

| 情境 | 建議 |
|------|------|
| 6 碼是核心功能 | 使用 Bundled 版本 |
| 6 碼是選用功能 | 使用 Lazy 版本 |
| 需要減少初始載入 | 使用 Lazy 版本 |
| 離線優先應用 | 使用 Bundled 版本 |

## 資料來源

Lazy 版本資料以縣市為單位拆分：

```
data/zip6/
├── cities.json      # 縣市列表 + zip3 對照（~10KB）
├── 臺北市.json      # 臺北市所有行政區資料（~200KB）
├── 新北市.json
└── ...
```

每個縣市資料約 50-265KB，按需載入。
