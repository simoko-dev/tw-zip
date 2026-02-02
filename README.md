# @simoko/tw-zip

[![npm version](https://img.shields.io/npm/v/@simoko/tw-zip)](https://www.npmjs.com/package/@simoko/tw-zip)
[![license](https://img.shields.io/npm/l/@simoko/tw-zip)](LICENSE)

台灣縣市、行政區、郵遞區號（3碼／6碼）查詢工具，支援 React / Vue / 原生 JS。

**[▶ 線上試用 React](https://stackblitz.com/github/supra126/tw-zip/tree/main/playground/react?file=src%2FApp.tsx)** · **[▶ 線上試用 Vue](https://stackblitz.com/github/supra126/tw-zip/tree/main/playground/vue?file=src%2FApp.vue)**

## 安裝

```bash
npm install @simoko/tw-zip
```

## 快速開始

### 原生 JS

```typescript
import { getZipCode, getCityArray } from '@simoko/tw-zip'

getCityArray()           // ['台北市', '基隆市', ...]
getZipCode('中正區')      // ['100', '台北市', '中正區']
getZipCode('100')        // ['100', '台北市', '中正區']
```

### React

```tsx
import { useTwZip } from '@simoko/tw-zip/react'

function App() {
  const { cities, city, setCity, districts, district, setDistrict, zipCode } = useTwZip()

  return (
    <>
      <select value={city} onChange={e => setCity(e.target.value)}>
        {cities.map(c => <option key={c}>{c}</option>)}
      </select>
      <select value={district} onChange={e => setDistrict(e.target.value)}>
        {districts.map(d => <option key={d.value}>{d.label}</option>)}
      </select>
      <p>郵遞區號：{zipCode}</p>
    </>
  )
}
```

### Vue

```vue
<script setup>
import { useTwZip } from '@simoko/tw-zip/vue'
const { cities, city, districts, zipCode } = useTwZip()
</script>

<template>
  <select v-model="city">
    <option v-for="c in cities" :key="c">{{ c }}</option>
  </select>
  <select v-model="zipCode">
    <option v-for="d in districts" :key="d.value" :value="d.value">{{ d.label }}</option>
  </select>
  <p>郵遞區號：{{ zipCode }}</p>
</template>
```

## 6 碼郵遞區號

需要街道層級精確投遞（3+3 格式）？

```typescript
import { getZipCode6 } from '@simoko/tw-zip/zip6'

getZipCode6({ city: '臺北市', area: '中正區', road: '三元街', number: 145 })
// { zipcode: '100060', zip3: '100', city: '臺北市', area: '中正區', road: '三元街' }
```

> 6 碼模組約 1.7MB，可使用 [Lazy Load 版本](docs/lazy.md) 按需載入。

## 文件

| 文件 | 說明 |
|------|------|
| [3 碼 API](docs/api-3.md) | 縣市、行政區、郵遞區號查詢 |
| [6 碼 API](docs/api-6.md) | 街道層級精確查詢 |
| [React Hooks](docs/react.md) | useTwZip / useTwZip6 |
| [Vue Composables](docs/vue.md) | useTwZip / useTwZip6 |
| [Lazy Load](docs/lazy.md) | 按縣市動態載入，減少初始大小 |

## 授權

MIT
