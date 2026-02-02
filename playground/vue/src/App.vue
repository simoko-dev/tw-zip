<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTwZip } from '@simoko/tw-zip/vue'
import { useTwZip6 as useTwZip6Lazy } from '@simoko/tw-zip/vue/lazy'
import { searchDistricts } from '@simoko/tw-zip'
import {
  getAreas6,
  getCities6,
  getRoads6,
  getZipCode6,
  searchRoads6,
} from '@simoko/tw-zip/zip6'

// 3 碼
const { cities, districts, city, district, zipCode } = useTwZip()
const searchKeyword = ref('')
const searchResults = computed(() =>
  searchKeyword.value.trim() ? searchDistricts(searchKeyword.value) : []
)

const selectFromSearch = (c: string, d: string) => {
  city.value = c
  district.value = d
  searchKeyword.value = ''
}

// 6 碼
const city6 = ref('')
const area6 = ref('')
const road6 = ref('')
const number6 = ref('')
const searchRoad = ref('')

const cities6 = getCities6()
const areas6 = computed(() => city6.value ? getAreas6(city6.value) : [])
const roads6 = computed(() => city6.value && area6.value ? getRoads6(city6.value, area6.value) : [])

const zip6Result = computed(() => {
  if (!city6.value || !area6.value || !road6.value) return null
  return getZipCode6({
    city: city6.value,
    area: area6.value,
    road: road6.value,
    number: number6.value ? Number(number6.value) : undefined,
  })
})

const roadSearchResults = computed(() =>
  searchRoad.value.trim()
    ? searchRoads6(searchRoad.value, city6.value || undefined, area6.value || undefined).slice(0, 10)
    : []
)

watch(city6, () => {
  area6.value = ''
  road6.value = ''
})

watch(area6, () => {
  road6.value = ''
})

const selectRoad = (r: { city: string; area: string; road: string }) => {
  city6.value = r.city
  area6.value = r.area
  road6.value = r.road
  searchRoad.value = ''
}

// 6 碼 Lazy Load
const {
  loading: lazyLoading,
  cities: lazyCities,
  areas: lazyAreas,
  roads: lazyRoads,
  city: lazyCity,
  area: lazyArea,
  road: lazyRoad,
  number: lazyNumber,
  setCity: setLazyCity,
  setArea: setLazyArea,
  setRoad: setLazyRoad,
  zipCode: lazyZipCode,
  result: lazyResult,
} = useTwZip6Lazy()

const setLazyNumber = (value: string) => {
  lazyNumber.value = value ? Number(value) : undefined
}
</script>

<template>
  <div class="container">
    <h1>@simoko/tw-zip</h1>
    <p class="subtitle">台灣縣市、行政區、郵遞區號選擇器</p>

    <!-- 3 碼區塊 -->
    <section class="section">
      <h2>3 碼郵遞區號</h2>

      <div class="selector-group">
        <div class="selector">
          <label>縣市</label>
          <select v-model="city">
            <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="selector">
          <label>行政區</label>
          <select v-model="zipCode">
            <option v-for="d in districts" :key="d.label" :value="d.value">
              {{ d.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="result">
        <div class="result-item">
          <span class="label">郵遞區號</span>
          <span class="value zipcode">{{ zipCode }}</span>
        </div>
        <div class="result-item">
          <span class="label">完整地址</span>
          <span class="value">{{ zipCode }} {{ city }}{{ district }}</span>
        </div>
      </div>

      <!-- 行政區搜尋 -->
      <div class="search-section">
        <label>搜尋行政區</label>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="輸入關鍵字，例如：中正"
        >
        <ul v-if="searchResults.length > 0" class="search-results">
          <li
            v-for="[zip, c, d] in searchResults.slice(0, 8)"
            :key="`${c}-${d}`"
            @click="selectFromSearch(c, d)"
          >
            <span class="zip">{{ zip }}</span> {{ c }} {{ d }}
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
          <select v-model="city6">
            <option value="">請選擇</option>
            <option v-for="c in cities6" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="selector">
          <label>行政區</label>
          <select v-model="area6" :disabled="!city6">
            <option value="">請選擇</option>
            <option v-for="a in areas6" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>

        <div class="selector">
          <label>路名</label>
          <select v-model="road6" :disabled="!area6">
            <option value="">請選擇</option>
            <option v-for="r in roads6" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="selector small">
          <label>門牌</label>
          <input
            v-model="number6"
            type="number"
            placeholder="號"
            :disabled="!road6"
          >
        </div>
      </div>

      <div v-if="zip6Result" class="result">
        <div class="result-item">
          <span class="label">6 碼郵遞區號</span>
          <span class="value zipcode">{{ zip6Result.zipcode }}</span>
        </div>
        <div class="result-item">
          <span class="label">完整地址</span>
          <span class="value">
            {{ zip6Result.zipcode }} {{ zip6Result.city }}{{ zip6Result.area }}{{ zip6Result.road }}{{ number6 ? `${number6}號` : '' }}
          </span>
        </div>
      </div>

      <!-- 路名搜尋 -->
      <div class="search-section">
        <label>搜尋路名</label>
        <input
          v-model="searchRoad"
          type="text"
          placeholder="輸入關鍵字，例如：忠孝東路"
        >
        <ul v-if="roadSearchResults.length > 0" class="search-results">
          <li
            v-for="r in roadSearchResults"
            :key="`${r.city}-${r.area}-${r.road}`"
            @click="selectRoad(r)"
          >
            {{ r.city }} {{ r.area }} <strong>{{ r.road }}</strong>
          </li>
        </ul>
      </div>
    </section>

    <!-- 6 碼 Lazy Load 區塊 -->
    <section class="section">
      <h2>6 碼 Lazy Load <span v-if="lazyLoading" style="font-size: 0.8rem; color: #999">(載入中...)</span></h2>

      <div class="selector-group">
        <div class="selector">
          <label>縣市</label>
          <select :value="lazyCity" @change="setLazyCity(($event.target as HTMLSelectElement).value)" :disabled="lazyLoading">
            <option value="">請選擇</option>
            <option v-for="c in lazyCities" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="selector">
          <label>行政區</label>
          <select :value="lazyArea" @change="setLazyArea(($event.target as HTMLSelectElement).value)" :disabled="lazyLoading || !lazyCity">
            <option value="">請選擇</option>
            <option v-for="a in lazyAreas" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>

        <div class="selector">
          <label>路名</label>
          <select :value="lazyRoad" @change="setLazyRoad(($event.target as HTMLSelectElement).value)" :disabled="lazyLoading || !lazyArea">
            <option value="">請選擇</option>
            <option v-for="r in lazyRoads" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="selector small">
          <label>門牌</label>
          <input
            type="number"
            placeholder="號"
            :value="lazyNumber ?? ''"
            @input="setLazyNumber(($event.target as HTMLInputElement).value)"
            :disabled="lazyLoading || !lazyRoad"
          >
        </div>
      </div>

      <div v-if="lazyResult" class="result">
        <div class="result-item">
          <span class="label">6 碼郵遞區號</span>
          <span class="value zipcode">{{ lazyZipCode }}</span>
        </div>
        <div class="result-item">
          <span class="label">完整地址</span>
          <span class="value">
            {{ lazyResult.zipcode }} {{ lazyResult.city }}{{ lazyResult.area }}{{ lazyResult.road }}{{ lazyNumber ? `${lazyNumber}號` : '' }}
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
</template>
