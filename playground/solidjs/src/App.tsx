import { createSignal, createMemo, For, Show } from 'solid-js'
import { searchDistricts, getCityArray, getDistrictArray } from '@simoko/tw-zip'
import {
  getAreas6,
  getCities6,
  getRoads6,
  getZipCode6,
  searchRoads6,
} from '@simoko/tw-zip/zip6'
import { useTwZip6 as useTwZip6Lazy } from '@simoko/tw-zip/solidjs/lazy'

function App() {
  // 3 碼
  const cities = getCityArray()
  const [city, setCity] = createSignal(cities[0])
  const districts = createMemo(() => getDistrictArray(city()))
  const [zipCode, setZipCode] = createSignal(districts()[0]?.value ?? '')
  const district = createMemo(() => districts().find(d => d.value === zipCode())?.label ?? '')
  const [searchKeyword, setSearchKeyword] = createSignal('')
  const searchResults = createMemo(() =>
    searchKeyword().trim() ? searchDistricts(searchKeyword()) : []
  )

  const handleCityChange = (value: string) => {
    setCity(value)
    const ds = getDistrictArray(value)
    setZipCode(ds[0]?.value ?? '')
  }

  const handleDistrictChange = (label: string) => {
    const found = districts().find(d => d.label === label)
    if (found) setZipCode(found.value)
  }

  const selectFromSearch = (c: string, d: string) => {
    handleCityChange(c)
    handleDistrictChange(d)
    setSearchKeyword('')
  }

  // 6 碼
  const cities6 = getCities6()
  const [city6, setCity6] = createSignal('')
  const [area6, setArea6] = createSignal('')
  const [road6, setRoad6] = createSignal('')
  const [number6, setNumber6] = createSignal('')
  const [searchRoad, setSearchRoad] = createSignal('')

  const areas6 = createMemo(() => city6() ? getAreas6(city6()) : [])
  const roads6 = createMemo(() => city6() && area6() ? getRoads6(city6(), area6()) : [])

  const zip6Result = createMemo(() => {
    if (!city6() || !area6() || !road6()) return null
    return getZipCode6({
      city: city6(),
      area: area6(),
      road: road6(),
      number: number6() ? Number(number6()) : undefined,
    })
  })

  const roadSearchResults = createMemo(() =>
    searchRoad().trim()
      ? searchRoads6(searchRoad(), city6() || undefined, area6() || undefined).slice(0, 10)
      : []
  )

  const handleCity6Change = (value: string) => {
    setCity6(value)
    setArea6('')
    setRoad6('')
  }

  const handleArea6Change = (value: string) => {
    setArea6(value)
    setRoad6('')
  }

  const selectRoad = (r: { city: string; area: string; road: string }) => {
    setCity6(r.city)
    setArea6(r.area)
    setRoad6(r.road)
    setSearchRoad('')
  }

  return (
    <div class="container">
      <h1>@simoko/tw-zip</h1>
      <p class="subtitle">台灣縣市、行政區、郵遞區號選擇器</p>

      {/* 3 碼區塊 */}
      <section class="section">
        <h2>3 碼郵遞區號</h2>

        <div class="selector-group">
          <div class="selector">
            <label>縣市</label>
            <select value={city()} onChange={e => handleCityChange(e.target.value)}>
              <For each={cities}>{c => <option value={c}>{c}</option>}</For>
            </select>
          </div>

          <div class="selector">
            <label>行政區</label>
            <select value={district()} onChange={e => handleDistrictChange(e.target.value)}>
              <For each={districts()}>{d => <option value={d.label}>{d.label}</option>}</For>
            </select>
          </div>
        </div>

        <div class="result">
          <div class="result-item">
            <span class="label">郵遞區號</span>
            <span class="value zipcode">{zipCode()}</span>
          </div>
          <div class="result-item">
            <span class="label">完整地址</span>
            <span class="value">{zipCode()} {city()}{district()}</span>
          </div>
        </div>

        {/* 行政區搜尋 */}
        <div class="search-section">
          <label>搜尋行政區</label>
          <input
            type="text"
            placeholder="輸入關鍵字，例如：中正"
            value={searchKeyword()}
            onInput={e => setSearchKeyword(e.target.value)}
          />
          <Show when={searchResults().length > 0}>
            <ul class="search-results">
              <For each={searchResults().slice(0, 8)}>
                {([zip, c, d]) => (
                  <li onClick={() => selectFromSearch(c, d)}>
                    <span class="zip">{zip}</span> {c} {d}
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </section>

      {/* 6 碼區塊 */}
      <section class="section">
        <h2>6 碼郵遞區號 (3+3)</h2>

        <div class="selector-group">
          <div class="selector">
            <label>縣市</label>
            <select value={city6()} onChange={e => handleCity6Change(e.target.value)}>
              <option value="">請選擇</option>
              <For each={cities6}>{c => <option value={c}>{c}</option>}</For>
            </select>
          </div>

          <div class="selector">
            <label>行政區</label>
            <select value={area6()} onChange={e => handleArea6Change(e.target.value)} disabled={!city6()}>
              <option value="">請選擇</option>
              <For each={areas6()}>{a => <option value={a}>{a}</option>}</For>
            </select>
          </div>

          <div class="selector">
            <label>路名</label>
            <select value={road6()} onChange={e => setRoad6(e.target.value)} disabled={!area6()}>
              <option value="">請選擇</option>
              <For each={roads6()}>{r => <option value={r}>{r}</option>}</For>
            </select>
          </div>

          <div class="selector small">
            <label>門牌</label>
            <input
              type="number"
              placeholder="號"
              value={number6()}
              onInput={e => setNumber6(e.target.value)}
              disabled={!road6()}
            />
          </div>
        </div>

        <Show when={zip6Result()}>
          {result => (
            <div class="result">
              <div class="result-item">
                <span class="label">6 碼郵遞區號</span>
                <span class="value zipcode">{result().zipcode}</span>
              </div>
              <div class="result-item">
                <span class="label">完整地址</span>
                <span class="value">
                  {result().zipcode} {result().city}{result().area}{result().road}{number6() ? `${number6()}號` : ''}
                </span>
              </div>
            </div>
          )}
        </Show>

        {/* 路名搜尋 */}
        <div class="search-section">
          <label>搜尋路名</label>
          <input
            type="text"
            placeholder="輸入關鍵字，例如：忠孝東路"
            value={searchRoad()}
            onInput={e => setSearchRoad(e.target.value)}
          />
          <Show when={roadSearchResults().length > 0}>
            <ul class="search-results">
              <For each={roadSearchResults()}>
                {r => (
                  <li onClick={() => selectRoad(r)}>
                    {r.city} {r.area} <strong>{r.road}</strong>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </section>

      <Zip6LazySection />

      <a
        class="github-link"
        href="https://github.com/supra126/tw-zip"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub
      </a>
    </div>
  )
}

function Zip6LazySection() {
  const lazy = useTwZip6Lazy()

  return (
    <section class="section">
      <h2>6 碼 Lazy Load {lazy.loading() && <span style={{ "font-size": '0.8rem', color: '#999' }}>(載入中...)</span>}</h2>

      <div class="selector-group">
        <div class="selector">
          <label>縣市</label>
          <select value={lazy.city()} onChange={e => lazy.setCity(e.target.value)} disabled={lazy.loading()}>
            <option value="">請選擇</option>
            <For each={lazy.cities()}>{c => <option value={c}>{c}</option>}</For>
          </select>
        </div>

        <div class="selector">
          <label>行政區</label>
          <select value={lazy.area()} onChange={e => lazy.setArea(e.target.value)} disabled={lazy.loading() || !lazy.city()}>
            <option value="">請選擇</option>
            <For each={lazy.areas()}>{a => <option value={a}>{a}</option>}</For>
          </select>
        </div>

        <div class="selector">
          <label>路名</label>
          <select value={lazy.road()} onChange={e => lazy.setRoad(e.target.value)} disabled={lazy.loading() || !lazy.area()}>
            <option value="">請選擇</option>
            <For each={lazy.roads()}>{r => <option value={r}>{r}</option>}</For>
          </select>
        </div>

        <div class="selector small">
          <label>門牌</label>
          <input
            type="number"
            placeholder="號"
            value={lazy.number() ?? ''}
            onInput={e => lazy.setNumber(e.target.value ? Number(e.target.value) : undefined)}
            disabled={lazy.loading() || !lazy.road()}
          />
        </div>
      </div>

      <Show when={lazy.result()}>
        {result => (
          <div class="result">
            <div class="result-item">
              <span class="label">6 碼郵遞區號</span>
              <span class="value zipcode">{lazy.zipCode()}</span>
            </div>
            <div class="result-item">
              <span class="label">完整地址</span>
              <span class="value">
                {result().zipcode} {result().city}{result().area}{result().road}{lazy.number() ? `${lazy.number()}號` : ''}
              </span>
            </div>
          </div>
        )}
      </Show>

      <p style={{ "font-size": '0.75rem', color: '#888', "margin-top": '0.5rem' }}>
        資料按縣市動態載入，初始僅 ~5KB
      </p>
    </section>
  )
}

export default App
