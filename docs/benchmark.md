# 效能基準測試

本專案使用 [Vitest Bench](https://vitest.dev/guide/features.html#benchmarking) 進行效能測試。

## 執行測試

```bash
npm run bench
```

## 測試環境

- Node.js v22+
- Vitest v4.0.18
- Apple M1/M2 或同等效能 CPU

## 測試結果

> 以下數據為參考值，實際效能依執行環境而異。

### 3 碼郵遞區號

#### 資料查詢

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `getCityArray()` | ~23,000,000 | < 0.0001ms |
| `getDistricts()` | ~23,000,000 | < 0.0001ms |
| `getDistrictArray()` | ~1,500,000 | < 0.001ms |
| `getFlatArray()` | ~400,000 | < 0.003ms |

#### 郵遞區號查詢

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `getZipCode()` | ~13,000,000 | < 0.0001ms |
| `getZipCodeAll()` | ~12,500,000 | < 0.0001ms |
| `getZipCodeByCity()` | ~12,400,000 | < 0.0001ms |

#### 搜尋

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `searchDistricts()` | ~39,000 | ~0.025ms |

#### 驗證

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `isValidCity()` | ~17,000,000 | < 0.0001ms |
| `isValidDistrict()` | ~18,000,000 | < 0.0001ms |
| `isValidZipCode()` | ~20,000,000 | < 0.0001ms |

### 6 碼郵遞區號

#### 資料查詢

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `getCities6()` | ~18,000,000 | < 0.0001ms |
| `getAreas6()` | ~19,000,000 | < 0.0001ms |
| `getRoads6()` | ~9,800,000 | ~0.0001ms |

#### 郵遞區號查詢

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `getZipCode6()` | ~14,000,000 | < 0.0001ms |
| `getZipCodes6ByRoad()` | ~3,500,000 | ~0.0003ms |

#### 搜尋

| API | 條件 | ops/sec | 平均耗時 |
|-----|------|--------:|---------|
| `searchRoads6()` | 全域搜尋 | ~1,200 | ~0.8ms |
| `searchRoads6()` | 限定縣市 | ~52,000 | ~0.02ms |
| `searchRoads6()` | 限定縣市+行政區 | ~650,000 | ~0.0015ms |

#### 驗證

| API | ops/sec | 平均耗時 |
|-----|--------:|---------|
| `isValidZipCode6()` | ~14,000,000 | < 0.0001ms |

## 效能建議

### 路名搜尋最佳化

全域路名搜尋需遍歷約 1.7MB 資料，建議：

```typescript
// ❌ 較慢 - 全域搜尋 (~1,200 ops/sec)
searchRoads6('中正路')

// ✅ 較快 - 限定縣市 (~52,000 ops/sec, 快 43 倍)
searchRoads6('中正路', { city: '臺北市' })

// ✅ 最快 - 限定縣市和行政區 (~650,000 ops/sec, 快 540 倍)
searchRoads6('中正路', { city: '臺北市', area: '中正區' })
```

### 使用 Lazy Loading

如果 6 碼功能非核心需求，使用 Lazy Loading 版本可減少初始載入：

```typescript
// 完整載入 (~1.7MB)
import { useTwZip6 } from '@simoko/tw-zip/react'

// 按需載入 (初始 ~5KB，按縣市載入 50-265KB)
import { useTwZip6 } from '@simoko/tw-zip/react/lazy'
```

## 自行執行測試

```bash
# 執行所有基準測試
npm run bench

# 只執行特定測試
npm run bench -- --grep "3 碼"
```
