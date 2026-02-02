# Angular Services

使用 Angular signals 的響應式郵遞區號查詢服務。

> **注意**: 需要 Angular 16+ 版本（支援 signals）

## 安裝

```bash
npm install @simoko/tw-zip @angular/core
```

## 3 碼查詢 - TwZipService

```typescript
import { Component } from '@angular/core'
import { TwZipService } from '@simoko/tw-zip/angular'

@Component({
  selector: 'app-zip',
  template: `
    <select [value]="twZip.city()" (change)="twZip.setCity($any($event.target).value)">
      <option *ngFor="let c of twZip.cities" [value]="c">{{ c }}</option>
    </select>

    <select (change)="twZip.setDistrict($any($event.target).value)">
      <option *ngFor="let d of twZip.districts()" [value]="d.label" [selected]="d.label === twZip.district()">
        {{ d.label }}
      </option>
    </select>

    <p>郵遞區號：{{ twZip.zipCode() }}</p>
  `,
})
export class ZipComponent {
  constructor(public twZip: TwZipService) {}
}
```

### TwZipService 屬性和方法

| 名稱 | 類型 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表（靜態） |
| `city` | `Signal<string>` | 目前選中縣市 |
| `districts` | `Signal<{label, value}[]>` | 行政區列表 |
| `district` | `Signal<string>` | 目前選中行政區（computed） |
| `zipCode` | `Signal<string>` | 郵遞區號 |
| `setCity(value)` | `void` | 設定縣市 |
| `setDistrict(value)` | `void` | 設定行政區 |
| `setZipCode(value)` | `void` | 設定郵遞區號 |

## 6 碼查詢 - TwZip6Service

```typescript
import { Component } from '@angular/core'
import { TwZip6Service } from '@simoko/tw-zip/angular'

@Component({
  selector: 'app-zip6',
  template: `
    <select [value]="twZip6.city()" (change)="twZip6.setCity($any($event.target).value)">
      <option *ngFor="let c of twZip6.cities" [value]="c">{{ c }}</option>
    </select>

    <select [value]="twZip6.area()" (change)="twZip6.setArea($any($event.target).value)">
      <option *ngFor="let a of twZip6.areas()" [value]="a">{{ a }}</option>
    </select>

    <select [value]="twZip6.road()" (change)="twZip6.setRoad($any($event.target).value)">
      <option *ngFor="let r of twZip6.roads()" [value]="r">{{ r }}</option>
    </select>

    <input type="number" [value]="twZip6.number()" (input)="twZip6.setNumber(+$any($event.target).value || undefined)" placeholder="門牌號碼" />

    <p>郵遞區號：{{ twZip6.zipCode() }}（3碼：{{ twZip6.zip3() }}）</p>
  `,
})
export class Zip6Component {
  constructor(public twZip6: TwZip6Service) {}
}
```

### TwZip6Service 屬性和方法

| 名稱 | 類型 | 說明 |
|------|------|------|
| `cities` | `string[]` | 縣市列表（靜態） |
| `areas` | `Signal<string[]>` | 行政區列表 |
| `roads` | `Signal<string[]>` | 路名列表 |
| `city` | `Signal<string>` | 目前縣市 |
| `area` | `Signal<string>` | 目前行政區 |
| `road` | `Signal<string>` | 目前路名 |
| `number` | `Signal<number \| undefined>` | 門牌號碼 |
| `lane` | `Signal<number \| undefined>` | 巷 |
| `alley` | `Signal<number \| undefined>` | 弄 |
| `zipCode` | `Signal<string>` | 6 碼郵遞區號（computed） |
| `zip3` | `Signal<string>` | 3 碼郵遞區號（computed） |
| `result` | `Signal<Zip6Result \| undefined>` | 完整結果（computed） |
| `searchResults` | `Signal<SearchResult[]>` | 搜尋結果 |
| `setCity(value)` | `void` | 設定縣市 |
| `setArea(value)` | `void` | 設定行政區 |
| `setRoad(value)` | `void` | 設定路名 |
| `setNumber(value)` | `void` | 設定門牌號碼 |
| `setLane(value)` | `void` | 設定巷 |
| `setAlley(value)` | `void` | 設定弄 |
| `searchRoads(keyword)` | `void` | 搜尋路名 |

## 使用 Standalone Components

```typescript
import { Component } from '@angular/core'
import { NgFor } from '@angular/common'
import { TwZipService } from '@simoko/tw-zip/angular'

@Component({
  selector: 'app-zip',
  standalone: true,
  imports: [NgFor],
  template: `
    <select [value]="twZip.city()" (change)="twZip.setCity($any($event.target).value)">
      <option *ngFor="let c of twZip.cities" [value]="c">{{ c }}</option>
    </select>
    <p>郵遞區號：{{ twZip.zipCode() }}</p>
  `,
})
export class ZipComponent {
  constructor(public twZip: TwZipService) {}
}
```

## 6 碼 Lazy Load - TwZip6LazyService

6 碼資料約 1.7MB，Lazy 版本按縣市動態載入，初始僅約 5KB。

```typescript
import { Component, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TwZip6LazyService } from '@simoko/tw-zip/angular/lazy'

@Component({
  selector: 'app-zip6-lazy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="zip6.loading()">載入中...</div>
    <ng-container *ngIf="!zip6.loading()">
      <select [value]="zip6.city()" (change)="onCityChange($any($event.target).value)">
        <option *ngFor="let c of zip6.cities()" [value]="c">{{ c }}</option>
      </select>

      <select [value]="zip6.area()" (change)="zip6.setArea($any($event.target).value)">
        <option *ngFor="let a of zip6.areas()" [value]="a">{{ a }}</option>
      </select>

      <select [value]="zip6.road()" (change)="zip6.setRoad($any($event.target).value)">
        <option *ngFor="let r of zip6.roads()" [value]="r">{{ r }}</option>
      </select>

      <input
        type="number"
        [value]="zip6.number() ?? ''"
        (input)="zip6.setNumber($any($event.target).value ? +$any($event.target).value : undefined)"
        placeholder="門牌號碼"
      />

      <p>郵遞區號：{{ zip6.zipCode() }}</p>
    </ng-container>
  `,
})
export class Zip6LazyComponent implements OnInit {
  readonly zip6 = inject(TwZip6LazyService)

  ngOnInit() {
    this.zip6.init()
  }

  onCityChange(value: string) {
    this.zip6.setCity(value)
  }
}
```

> **重要**：必須在 `ngOnInit()` 中呼叫 `init()` 初始化服務。

### TwZip6LazyService 屬性和方法

| 名稱 | 類型 | 說明 |
|------|------|------|
| `loading` | `Signal<boolean>` | 載入狀態 |
| `cities` | `Signal<string[]>` | 縣市列表 |
| `areas` | `Signal<string[]>` | 行政區列表 |
| `roads` | `Signal<string[]>` | 路名列表 |
| `city` | `Signal<string>` | 目前縣市 |
| `area` | `Signal<string>` | 目前行政區 |
| `road` | `Signal<string>` | 目前路名 |
| `number` | `Signal<number \| undefined>` | 門牌號碼 |
| `zipCode` | `Signal<string>` | 6 碼郵遞區號（computed） |
| `zip3` | `Signal<string>` | 3 碼郵遞區號（computed） |
| `result` | `Signal<Zip6Result \| undefined>` | 完整結果（computed） |
| `init(options?)` | `Promise<void>` | 初始化服務 |
| `setCity(value)` | `Promise<void>` | 設定縣市（非同步） |
| `setArea(value)` | `void` | 設定行政區 |
| `setRoad(value)` | `void` | 設定路名 |
| `setNumber(value)` | `void` | 設定門牌號碼 |
| `preloadCities(cities)` | `Promise<void>` | 預載入縣市 |
| `isCityCached(city)` | `boolean` | 檢查是否已快取 |
| `clearCache()` | `void` | 清除快取 |

### 選項

```typescript
await this.zip6.init({
  // 自訂資料來源
  baseUrl: 'https://your-cdn.com/data/zip6',
  // 預載入縣市
  preload: ['臺北市', '新北市'],
})
```

## 注意事項

- Angular 的 services 預設為 `providedIn: 'root'`，整個應用共用同一個實例
- 如需多個獨立實例，可在 component 的 `providers` 中單獨提供
- 6 碼 Bundled 版本約 1.7MB，Lazy 版本初始僅約 5KB
