<script lang="ts">
  import { searchDistricts, getCityArray, getDistrictArray } from '@simoko/tw-zip'
  import {
    getAreas6,
    getCities6,
    getRoads6,
    getZipCode6,
    searchRoads6,
  } from '@simoko/tw-zip/zip6'
  import { createTwZip6 as createTwZip6Lazy } from '@simoko/tw-zip/svelte/lazy'

  // 6 碼 Lazy Load
  const lazy = createTwZip6Lazy()
  const {
    loading: lazyLoading,
    cities: lazyCities,
    areas: lazyAreas,
    roads: lazyRoads,
    city: lazyCity,
    area: lazyArea,
    road: lazyRoad,
    number: lazyNumber,
    result: lazyResult,
    zipCode: lazyZipCode,
    setCity: setLazyCity,
    setArea: setLazyArea,
    setRoad: setLazyRoad,
    setNumber: setLazyNumber,
  } = lazy

  // 3 碼
  const cities = getCityArray()
  let city = $state(cities[0])
  let districts = $derived(getDistrictArray(city))
  let zipCode = $state(districts[0]?.value ?? '')
  let district = $derived(districts.find(d => d.value === zipCode)?.label ?? '')
  let searchKeyword = $state('')
  let searchResults = $derived(
    searchKeyword.trim() ? searchDistricts(searchKeyword) : []
  )

  function setCity(value: string) {
    city = value
    const ds = getDistrictArray(value)
    zipCode = ds[0]?.value ?? ''
  }

  function setDistrict(label: string) {
    const found = districts.find(d => d.label === label)
    if (found) zipCode = found.value
  }

  function selectFromSearch(c: string, d: string) {
    setCity(c)
    setDistrict(d)
    searchKeyword = ''
  }

  // 6 碼
  const cities6 = getCities6()
  let city6 = $state('')
  let area6 = $state('')
  let road6 = $state('')
  let number6 = $state('')
  let searchRoad = $state('')

  let areas6 = $derived(city6 ? getAreas6(city6) : [])
  let roads6 = $derived(city6 && area6 ? getRoads6(city6, area6) : [])

  let zip6Result = $derived(
    city6 && area6 && road6
      ? getZipCode6({
          city: city6,
          area: area6,
          road: road6,
          number: number6 ? Number(number6) : undefined,
        })
      : null
  )

  let roadSearchResults = $derived(
    searchRoad.trim()
      ? searchRoads6(searchRoad, city6 || undefined, area6 || undefined).slice(0, 10)
      : []
  )

  function handleCity6Change(value: string) {
    city6 = value
    area6 = ''
    road6 = ''
  }

  function handleArea6Change(value: string) {
    area6 = value
    road6 = ''
  }

  function selectRoad(r: { city: string; area: string; road: string }) {
    city6 = r.city
    area6 = r.area
    road6 = r.road
    searchRoad = ''
  }
</script>

<div class="container">
  <h1>@simoko/tw-zip</h1>
  <p class="subtitle">台灣縣市、行政區、郵遞區號選擇器</p>

  <!-- 3 碼區塊 -->
  <section class="section">
    <h2>3 碼郵遞區號</h2>

    <div class="selector-group">
      <div class="selector">
        <label>縣市</label>
        <select value={city} onchange={(e) => setCity(e.currentTarget.value)}>
          {#each cities as c}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </div>

      <div class="selector">
        <label>行政區</label>
        <select value={district} onchange={(e) => setDistrict(e.currentTarget.value)}>
          {#each districts as d}
            <option value={d.label}>{d.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="result">
      <div class="result-item">
        <span class="label">郵遞區號</span>
        <span class="value zipcode">{zipCode}</span>
      </div>
      <div class="result-item">
        <span class="label">完整地址</span>
        <span class="value">{zipCode} {city}{district}</span>
      </div>
    </div>

    <!-- 行政區搜尋 -->
    <div class="search-section">
      <label>搜尋行政區</label>
      <input
        type="text"
        placeholder="輸入關鍵字，例如：中正"
        bind:value={searchKeyword}
      />
      {#if searchResults.length > 0}
        <ul class="search-results">
          {#each searchResults.slice(0, 8) as [zip, c, d]}
            <li onclick={() => selectFromSearch(c, d)}>
              <span class="zip">{zip}</span> {c} {d}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- 6 碼區塊 -->
  <section class="section">
    <h2>6 碼郵遞區號 (3+3)</h2>

    <div class="selector-group">
      <div class="selector">
        <label>縣市</label>
        <select value={city6} onchange={(e) => handleCity6Change(e.currentTarget.value)}>
          <option value="">請選擇</option>
          {#each cities6 as c}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </div>

      <div class="selector">
        <label>行政區</label>
        <select value={area6} onchange={(e) => handleArea6Change(e.currentTarget.value)} disabled={!city6}>
          <option value="">請選擇</option>
          {#each areas6 as a}
            <option value={a}>{a}</option>
          {/each}
        </select>
      </div>

      <div class="selector">
        <label>路名</label>
        <select bind:value={road6} disabled={!area6}>
          <option value="">請選擇</option>
          {#each roads6 as r}
            <option value={r}>{r}</option>
          {/each}
        </select>
      </div>

      <div class="selector small">
        <label>門牌</label>
        <input
          type="number"
          placeholder="號"
          bind:value={number6}
          disabled={!road6}
        />
      </div>
    </div>

    {#if zip6Result}
      <div class="result">
        <div class="result-item">
          <span class="label">6 碼郵遞區號</span>
          <span class="value zipcode">{zip6Result.zipcode}</span>
        </div>
        <div class="result-item">
          <span class="label">完整地址</span>
          <span class="value">
            {zip6Result.zipcode} {zip6Result.city}{zip6Result.area}{zip6Result.road}{number6 ? `${number6}號` : ''}
          </span>
        </div>
      </div>
    {/if}

    <!-- 路名搜尋 -->
    <div class="search-section">
      <label>搜尋路名</label>
      <input
        type="text"
        placeholder="輸入關鍵字，例如：忠孝東路"
        bind:value={searchRoad}
      />
      {#if roadSearchResults.length > 0}
        <ul class="search-results">
          {#each roadSearchResults as r}
            <li onclick={() => selectRoad(r)}>
              {r.city} {r.area} <strong>{r.road}</strong>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>

  <!-- 6 碼 Lazy Load 區塊 -->
  <section class="section">
    <h2>6 碼 Lazy Load {#if $lazyLoading}<span style="font-size: 0.8rem; color: #999">(載入中...)</span>{/if}</h2>

    <div class="selector-group">
      <div class="selector">
        <label>縣市</label>
        <select value={$lazyCity} onchange={(e) => setLazyCity(e.currentTarget.value)} disabled={$lazyLoading}>
          <option value="">請選擇</option>
          {#each $lazyCities as c}
            <option value={c}>{c}</option>
          {/each}
        </select>
      </div>

      <div class="selector">
        <label>行政區</label>
        <select value={$lazyArea} onchange={(e) => setLazyArea(e.currentTarget.value)} disabled={$lazyLoading || !$lazyCity}>
          <option value="">請選擇</option>
          {#each $lazyAreas as a}
            <option value={a}>{a}</option>
          {/each}
        </select>
      </div>

      <div class="selector">
        <label>路名</label>
        <select value={$lazyRoad} onchange={(e) => setLazyRoad(e.currentTarget.value)} disabled={$lazyLoading || !$lazyArea}>
          <option value="">請選擇</option>
          {#each $lazyRoads as r}
            <option value={r}>{r}</option>
          {/each}
        </select>
      </div>

      <div class="selector small">
        <label>門牌</label>
        <input
          type="number"
          placeholder="號"
          value={$lazyNumber ?? ''}
          oninput={(e) => setLazyNumber(e.currentTarget.value ? Number(e.currentTarget.value) : undefined)}
          disabled={$lazyLoading || !$lazyRoad}
        />
      </div>
    </div>

    {#if $lazyResult}
      <div class="result">
        <div class="result-item">
          <span class="label">6 碼郵遞區號</span>
          <span class="value zipcode">{$lazyZipCode}</span>
        </div>
        <div class="result-item">
          <span class="label">完整地址</span>
          <span class="value">
            {$lazyResult.zipcode} {$lazyResult.city}{$lazyResult.area}{$lazyResult.road}{$lazyNumber ? `${$lazyNumber}號` : ''}
          </span>
        </div>
      </div>
    {/if}

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
