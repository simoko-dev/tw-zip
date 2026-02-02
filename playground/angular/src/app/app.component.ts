import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { searchDistricts, getCityArray, getDistrictArray } from '@simoko/tw-zip'
import {
  getAreas6,
  getCities6,
  getRoads6,
  getZipCode6,
  searchRoads6,
} from '@simoko/tw-zip/zip6'
import { TwZip6LazyService } from '@simoko/tw-zip/angular/lazy'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>&#64;simoko/tw-zip</h1>
      <p class="subtitle">台灣縣市、行政區、郵遞區號選擇器</p>

      <!-- 3 碼區塊 -->
      <section class="section">
        <h2>3 碼郵遞區號</h2>

        <div class="selector-group">
          <div class="selector">
            <label>縣市</label>
            <select [value]="city()" (change)="setCity($any($event.target).value)">
              <option *ngFor="let c of cities" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div class="selector">
            <label>行政區</label>
            <select [value]="district()" (change)="setDistrict($any($event.target).value)">
              <option *ngFor="let d of districts()" [value]="d.label">{{ d.label }}</option>
            </select>
          </div>
        </div>

        <div class="result">
          <div class="result-item">
            <span class="label">郵遞區號</span>
            <span class="value zipcode">{{ zipCode() }}</span>
          </div>
          <div class="result-item">
            <span class="label">完整地址</span>
            <span class="value">{{ zipCode() }} {{ city() }}{{ district() }}</span>
          </div>
        </div>

        <!-- 行政區搜尋 -->
        <div class="search-section">
          <label>搜尋行政區</label>
          <input
            type="text"
            placeholder="輸入關鍵字，例如：中正"
            [value]="searchKeyword()"
            (input)="searchKeyword.set($any($event.target).value)"
          />
          <ul *ngIf="searchResults().length > 0" class="search-results">
            <li
              *ngFor="let r of searchResults().slice(0, 8)"
              (click)="selectFromSearch(r[1], r[2])"
            >
              <span class="zip">{{ r[0] }}</span> {{ r[1] }} {{ r[2] }}
            </li>
          </ul>
        </div>
      </section>

      <!-- 6 碼區塊 -->
      <section class="section">
        <h2>6 碼郵遞區號 (3+3)</h2>

        <div class="selector-group">
          <div class="selector">
            <label>縣市</label>
            <select [value]="city6()" (change)="setCity6($any($event.target).value)">
              <option value="">請選擇</option>
              <option *ngFor="let c of cities6" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div class="selector">
            <label>行政區</label>
            <select [value]="area6()" (change)="setArea6($any($event.target).value)" [disabled]="!city6()">
              <option value="">請選擇</option>
              <option *ngFor="let a of areas6()" [value]="a">{{ a }}</option>
            </select>
          </div>

          <div class="selector">
            <label>路名</label>
            <select [value]="road6()" (change)="road6.set($any($event.target).value)" [disabled]="!area6()">
              <option value="">請選擇</option>
              <option *ngFor="let r of roads6()" [value]="r">{{ r }}</option>
            </select>
          </div>

          <div class="selector small">
            <label>門牌</label>
            <input
              type="number"
              placeholder="號"
              [value]="number6()"
              (input)="number6.set($any($event.target).value)"
              [disabled]="!road6()"
            />
          </div>
        </div>

        <div *ngIf="zip6Result()" class="result">
          <div class="result-item">
            <span class="label">6 碼郵遞區號</span>
            <span class="value zipcode">{{ zip6Result()?.zipcode }}</span>
          </div>
          <div class="result-item">
            <span class="label">完整地址</span>
            <span class="value">
              {{ zip6Result()?.zipcode }} {{ zip6Result()?.city }}{{ zip6Result()?.area }}{{ zip6Result()?.road }}{{ number6() ? number6() + '號' : '' }}
            </span>
          </div>
        </div>

        <!-- 路名搜尋 -->
        <div class="search-section">
          <label>搜尋路名</label>
          <input
            type="text"
            placeholder="輸入關鍵字，例如：忠孝東路"
            [value]="searchRoad()"
            (input)="searchRoad.set($any($event.target).value)"
          />
          <ul *ngIf="roadSearchResults().length > 0" class="search-results">
            <li *ngFor="let r of roadSearchResults()" (click)="selectRoad(r)">
              {{ r.city }} {{ r.area }} <strong>{{ r.road }}</strong>
            </li>
          </ul>
        </div>
      </section>

      <!-- 6 碼 Lazy Load 區塊 -->
      <section class="section">
        <h2>6 碼 Lazy Load <span *ngIf="lazyService.loading()" style="font-size: 0.8rem; color: #999">(載入中...)</span></h2>

        <div class="selector-group">
          <div class="selector">
            <label>縣市</label>
            <select [value]="lazyService.city()" (change)="onLazyCityChange($any($event.target).value)" [disabled]="lazyService.loading()">
              <option value="">請選擇</option>
              <option *ngFor="let c of lazyService.cities()" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div class="selector">
            <label>行政區</label>
            <select [value]="lazyService.area()" (change)="lazyService.setArea($any($event.target).value)" [disabled]="lazyService.loading() || !lazyService.city()">
              <option value="">請選擇</option>
              <option *ngFor="let a of lazyService.areas()" [value]="a">{{ a }}</option>
            </select>
          </div>

          <div class="selector">
            <label>路名</label>
            <select [value]="lazyService.road()" (change)="lazyService.setRoad($any($event.target).value)" [disabled]="lazyService.loading() || !lazyService.area()">
              <option value="">請選擇</option>
              <option *ngFor="let r of lazyService.roads()" [value]="r">{{ r }}</option>
            </select>
          </div>

          <div class="selector small">
            <label>門牌</label>
            <input
              type="number"
              placeholder="號"
              [value]="lazyService.number() ?? ''"
              (input)="onLazyNumberChange($any($event.target).value)"
              [disabled]="lazyService.loading() || !lazyService.road()"
            />
          </div>
        </div>

        <div *ngIf="lazyService.result()" class="result">
          <div class="result-item">
            <span class="label">6 碼郵遞區號</span>
            <span class="value zipcode">{{ lazyService.zipCode() }}</span>
          </div>
          <div class="result-item">
            <span class="label">完整地址</span>
            <span class="value">
              {{ lazyService.result()?.zipcode }} {{ lazyService.result()?.city }}{{ lazyService.result()?.area }}{{ lazyService.result()?.road }}{{ lazyService.number() ? lazyService.number() + '號' : '' }}
            </span>
          </div>
        </div>

        <p style="font-size: 0.75rem; color: #888; margin-top: 0.5rem">
          資料按縣市動態載入，初始僅 ~5KB
        </p>
      </section>

      <a
        class="github-link"
        href="https://github.com/supra126/tw-zip"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </div>
  `,
})
export class AppComponent implements OnInit {
  readonly lazyService = inject(TwZip6LazyService)
  // 3 碼
  cities = getCityArray()
  city = signal(this.cities[0])
  districts = computed(() => getDistrictArray(this.city()))
  zipCode = signal(this.districts()[0]?.value ?? '')
  district = computed(() => this.districts().find(d => d.value === this.zipCode())?.label ?? '')
  searchKeyword = signal('')
  searchResults = computed(() =>
    this.searchKeyword().trim() ? searchDistricts(this.searchKeyword()) : []
  )

  setCity(value: string) {
    this.city.set(value)
    const ds = getDistrictArray(value)
    this.zipCode.set(ds[0]?.value ?? '')
  }

  setDistrict(label: string) {
    const found = this.districts().find(d => d.label === label)
    if (found) this.zipCode.set(found.value)
  }

  selectFromSearch(c: string, d: string) {
    this.setCity(c)
    this.setDistrict(d)
    this.searchKeyword.set('')
  }

  // 6 碼
  cities6 = getCities6()
  city6 = signal('')
  area6 = signal('')
  road6 = signal('')
  number6 = signal('')
  searchRoad = signal('')

  areas6 = computed(() => this.city6() ? getAreas6(this.city6()) : [])
  roads6 = computed(() => this.city6() && this.area6() ? getRoads6(this.city6(), this.area6()) : [])

  zip6Result = computed(() => {
    if (!this.city6() || !this.area6() || !this.road6()) return null
    return getZipCode6({
      city: this.city6(),
      area: this.area6(),
      road: this.road6(),
      number: this.number6() ? Number(this.number6()) : undefined,
    })
  })

  roadSearchResults = computed(() =>
    this.searchRoad().trim()
      ? searchRoads6(this.searchRoad(), this.city6() || undefined, this.area6() || undefined).slice(0, 10)
      : []
  )

  setCity6(value: string) {
    this.city6.set(value)
    this.area6.set('')
    this.road6.set('')
  }

  setArea6(value: string) {
    this.area6.set(value)
    this.road6.set('')
  }

  selectRoad(r: { city: string; area: string; road: string }) {
    this.city6.set(r.city)
    this.area6.set(r.area)
    this.road6.set(r.road)
    this.searchRoad.set('')
  }

  // Lazy Load
  ngOnInit() {
    this.lazyService.init()
  }

  onLazyCityChange(value: string) {
    this.lazyService.setCity(value)
  }

  onLazyNumberChange(value: string) {
    this.lazyService.setNumber(value ? Number(value) : undefined)
  }
}
