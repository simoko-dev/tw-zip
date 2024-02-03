# @simoko/tw-zip

[![NPM version](https://img.shields.io/npm/v/@simoko/tw-zip?color=a1b858&label=)](https://www.npmjs.com/package/@simoko/tw-zip)

台灣 **縣市**、**行政區**、**郵遞區號**（3碼）資料

## Installation
Install using npm or your favourite package manager:
``` bash
npm i @simoko/tw-zip
```

Import:
``` js
import { getCityArray, getDistrictArray, getZipCode } from '@simoko/tw-zip'
```

## React
[stackblitz](https://stackblitz.com/edit/vitejs-vite-gfv7df?file=src%2FApp.tsx) | 
[codesandbox](https://codesandbox.io/p/sandbox/simoko-tw-zip-react-example-zs238y)

``` typescript
import { useTwZip } from '@simoko/tw-zip/react';

export function App() {
  const { cities, districts, setCity, setDistrict, city, district, zipCode } =
    useTwZip();

  return (
    <div>
      <select onChange={(e) => setCity(e.target.value)}>
        {cities.map((c, i) => {
          return <option key={i}>{c}</option>;
        })}
      </select>

      <select onChange={(e) => setDistrict(e.target.value)}>
        {districts.map((d, i) => {
          return <option key={i}>{d['label']}</option>;
        })}
      </select>

      <div>
        {city}, {district}, {zipCode}
      </div>
    </div>
  );
}
```

## Vue
[stackblitz](https://stackblitz.com/edit/vitejs-vite-akqxck?file=src%2FApp.vue) | 
[codesandbox](https://codesandbox.io/p/sandbox/simoko-tw-zip-react-example-zs238y?file=%2Fsrc%2FApp.tsx%3A1%2C1)
``` typescript
<script setup lang="ts">
import useTwZip from '@simoko/tw-zip/vue';
const { cities, districts, city, district, zipCode } = useTwZip();
</script>

<template>
  <div>
    <select v-model="city">
      <option v-for="(c, i) in cities" :key="i">
        {{ c }}
      </option>
    </select>

    <select v-model="zipCode">
      <option v-for="(d, i) in districts" :key="i" :value="d.value">
        {{ d.label }}
      </option>
    </select>

    <div>{{ city }}, {{ district }}, {{ zipCode }}</div>
  </div>
</template>
```

## Functions

### getCityArray

▸ **getCityArray**(): string[]

回傳縣市陣列

#### Returns

string[]

**`Example`**

```ts
getCityArray()
// [ "台北市", "基隆市", "新北市", ... ]
```

___

### getData

▸ **getData**(): ICity

回傳所有資料

#### Returns

ICity

**`Example`**

```ts
getData()
// { "台北市": { "中正區": "100", "大同區": "103", "中山區": "104", "松山區": "105", ... }, "基隆市": { "仁愛區": "200", "信義區": "201", "中正區": "202", ... }, ... }
```

___

### getDistrictArray

▸ **getDistrictArray**(`city?`, `«destructured»?`): Object[]

回傳行政區資料 - array

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `city` | null \| string | `null` | 縣市名稱 |
| `«destructured»` | Object | `{}` | - |
| › `label` | undefined \| string | `undefined` | - |
| › `value` | undefined \| string | `undefined` | - |

#### Returns

Object[]

**`Example`**

```ts
getDistrictArray('台北市', { label: 'key' })
// [ { key: "中正區", value: "100" }, { key: "大同區", value: "103" }, ... ]
```

___

### getDistricts

▸ **getDistricts**(`city?`): IDistrict

回傳行政區資料 - dist

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `city?` | string | 縣市名稱 |

#### Returns

IDistrict

**`Example`**

```ts
getDistricts('台北市')
// { "中正區": "100", "大同區": "103", ... }
```

___

### getFlatArray

▸ **getFlatArray**(`«destructured»?`): string[]

回傳扁平化陣列資訊

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | Object |
| › `city` | undefined \| string |
| › `symbol` | undefined \| string |

#### Returns

string[]

**`Example`**

```ts
getFlatArray('台北市')
// [ "100 台北市 中正區", "103 台北市 大同區", ... ]

getFlatArray({ city: '嘉義市', symbol: '#' })
// [ "600#嘉義市#東區", "600#嘉義市#西區" ]
```

___

### getZipCode

▸ **getZipCode**(`district`): undefined \| string[]

根據行政區回傳郵遞區號

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `district` | string | 行政區名稱 |

#### Returns

undefined \| string[]

**`Example`**

```ts
getZipCode('中正區')
// [ "100", "台北市", "中正區" ]
```

