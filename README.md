# @simoko/tw-zip

[![npm version](https://img.shields.io/npm/v/@simoko/tw-zip)](https://www.npmjs.com/package/@simoko/tw-zip)
[![license](https://img.shields.io/npm/l/@simoko/tw-zip)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vue](https://img.shields.io/badge/Vue-3+-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Angular](https://img.shields.io/badge/Angular-19+-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5+-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![SolidJS](https://img.shields.io/badge/SolidJS-1.9+-2C4F7C?logo=solid&logoColor=white)](https://www.solidjs.com/)
[![benchmark](https://img.shields.io/badge/benchmark-23M%20ops%2Fs-brightgreen)](docs/benchmark.md)

台灣縣市、行政區、郵遞區號（3碼／6碼）查詢工具，支援 React / Vue / Svelte / SolidJS / Angular / 原生 JS。

## 特色

- 🚀 **極速查詢** - 每秒 2300 萬次操作（[效能報告](docs/benchmark.md)）
- 📦 **多框架支援** - React / Vue / Svelte / SolidJS / Angular
- 🎯 **3+3 郵遞區號** - 支援 6 碼精確投遞查詢
- 🔍 **驗證與搜尋** - 驗證輸入、模糊搜尋行政區/路名
- 🔄 **Lazy Loading** - 按需載入，初始僅 5KB
- 🌳 **Tree Shaking** - 只打包你用到的部分

**[▶ React](https://supra126.github.io/tw-zip/react/)** · **[▶ Vue](https://supra126.github.io/tw-zip/vue/)** · **[▶ Svelte](https://supra126.github.io/tw-zip/svelte/)** · **[▶ SolidJS](https://supra126.github.io/tw-zip/solidjs/)** · **[▶ Angular](https://supra126.github.io/tw-zip/angular/)**

## 安裝

```bash
npm install @simoko/tw-zip
```

## 快速開始

### 原生 JS

```typescript
import {
  getZipCode,
  getCityArray,
  searchDistricts,
  isValidZipCode,
  isValidCity,
  getZipCodeAll
} from '@simoko/tw-zip'

// 基本查詢
getCityArray()                    // ['台北市', '基隆市', ...]
getZipCode('中正區')               // ['100', '台北市', '中正區']
getZipCode('100')                 // ['100', '台北市', '中正區']

// 模糊搜尋
searchDistricts('中正')            // [{ city: '台北市', district: '中正區', zipCode: '100' }, ...]

// 驗證
isValidZipCode('100')             // true
isValidCity('台北市')              // true

// 反向查詢（同名行政區）
getZipCodeAll('中正區')            // [['100', '台北市', '中正區'], ['300', '新竹市', '中正區'], ...]
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
        {districts.map(d => <option key={d.label} value={d.label}>{d.label}</option>)}
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
const { cities, city, districts, district, zipCode } = useTwZip()
</script>

<template>
  <select v-model="city">
    <option v-for="c in cities" :key="c">{{ c }}</option>
  </select>
  <select v-model="district">
    <option v-for="d in districts" :key="d.label" :value="d.label">{{ d.label }}</option>
  </select>
  <p>郵遞區號：{{ zipCode }}</p>
</template>
```

### Svelte

```svelte
<script>
import { createTwZip } from '@simoko/tw-zip/svelte'
const { cities, city, districts, district, zipCode, setCity } = createTwZip()
</script>

<select bind:value={$city} on:change={e => setCity(e.target.value)}>
  {#each $cities as c}
    <option>{c}</option>
  {/each}
</select>
<p>郵遞區號：{$zipCode}</p>
```

### SolidJS

```tsx
import { useTwZip } from '@simoko/tw-zip/solidjs'

function App() {
  const { cities, city, setCity, districts, zipCode } = useTwZip()

  return (
    <>
      <select value={city()} onChange={e => setCity(e.target.value)}>
        {cities.map(c => <option>{c}</option>)}
      </select>
      <p>郵遞區號：{zipCode()}</p>
    </>
  )
}
```

### Angular

```typescript
import { Component } from '@angular/core'
import { TwZipService } from '@simoko/tw-zip/angular'

@Component({
  selector: 'app-zip',
  template: `
    <select [value]="twZip.city()" (change)="twZip.setCity($event.target.value)">
      <option *ngFor="let c of twZip.cities">{{ c }}</option>
    </select>
    <p>郵遞區號：{{ twZip.zipCode() }}</p>
  `
})
export class ZipComponent {
  constructor(public twZip: TwZipService) {}
}
```

## 6 碼郵遞區號

需要街道層級精確投遞（3+3 格式）？

```typescript
import { getZipCode6 } from '@simoko/tw-zip/zip6'

getZipCode6({ city: '臺北市', area: '中正區', road: '三元街', number: 145 })
// { zipcode: '100060', zip3: '100', city: '臺北市', area: '中正區', road: '三元街' }
```

> 6 碼模組約 1.7MB，可使用 [Lazy Load 版本](docs/lazy.md) 按需載入。

## 打包大小

本套件支援 **Tree Shaking**，只會打包你實際使用的模組：

| 模組 | 說明 | 大小 (minified + gzip) |
|------|------|------------------------|
| `@simoko/tw-zip` | 3 碼查詢 | ~11 KB |
| `@simoko/tw-zip/react` | React Hook (3碼) | ~12 KB |
| `@simoko/tw-zip/vue` | Vue Composable (3碼) | ~12 KB |
| `@simoko/tw-zip/zip6` | 6 碼查詢 | ~260 KB |
| `@simoko/tw-zip/react/lazy` | React Lazy (6碼) | ~5 KB + 按需載入 |

> 💡 **只用 3 碼？** 只會打包約 11 KB，不會包含 6 碼的 1.7MB 資料。
>
> 💡 **需要 6 碼？** 使用 Lazy 版本，初始僅 5 KB，資料按縣市動態載入。

## 文件

| 文件 | 說明 |
|------|------|
| [3 碼 API](docs/api-3.md) | 縣市、行政區、郵遞區號查詢 |
| [6 碼 API](docs/api-6.md) | 街道層級精確查詢 |
| [React Hooks](docs/react.md) | useTwZip / useTwZip6 |
| [Vue Composables](docs/vue.md) | useTwZip / useTwZip6 |
| [Svelte Stores](docs/svelte.md) | createTwZip / createTwZip6 |
| [SolidJS Hooks](docs/solidjs.md) | useTwZip / useTwZip6 |
| [Angular Services](docs/angular.md) | TwZipService / TwZip6Service |
| [Lazy Load](docs/lazy.md) | 按縣市動態載入，減少初始大小 |
| [效能基準測試](docs/benchmark.md) | 效能報告與最佳化建議 |

## 授權

MIT
