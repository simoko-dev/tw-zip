import { useState } from 'react'
import { useTwZip } from '@simoko/tw-zip/react'
import { useTwZip6 as useTwZip6Lazy } from '@simoko/tw-zip/react/lazy'
import { searchDistricts } from '@simoko/tw-zip'
import {
  getAreas6,
  getCities6,
  getRoads6,
  getZipCode6,
  searchRoads6,
} from '@simoko/tw-zip/zip6'

function App() {
  // 3 碼
  const { cities, districts, setCity, setDistrict, city, district, zipCode } = useTwZip()
  const [searchKeyword, setSearchKeyword] = useState('')
  const searchResults = searchKeyword.trim() ? searchDistricts(searchKeyword) : []

  // 6 碼
  const [city6, setCity6] = useState('')
  const [area6, setArea6] = useState('')
  const [road6, setRoad6] = useState('')
  const [number6, setNumber6] = useState('')
  const [searchRoad, setSearchRoad] = useState('')

  const cities6 = getCities6()
  const areas6 = city6 ? getAreas6(city6) : []
  const roads6 = city6 && area6 ? getRoads6(city6, area6) : []

  const zip6Result = city6 && area6 && road6
    ? getZipCode6({
        city: city6,
        area: area6,
        road: road6,
        number: number6 ? Number(number6) : undefined,
      })
    : null

  const roadSearchResults = searchRoad.trim()
    ? searchRoads6(searchRoad, city6 || undefined, area6 || undefined).slice(0, 10)
    : []

  const handleCity6Change = (value: string) => {
    setCity6(value)
    setArea6('')
    setRoad6('')
  }

  const handleArea6Change = (value: string) => {
    setArea6(value)
    setRoad6('')
  }

  const handleRoadSelect = (result: { city: string; area: string; road: string }) => {
    setCity6(result.city)
    setArea6(result.area)
    setRoad6(result.road)
    setSearchRoad('')
  }

  return (
    <div className="container">
      <h1>@simoko/tw-zip</h1>
      <p className="subtitle">台灣縣市、行政區、郵遞區號選擇器</p>

      {/* 3 碼區塊 */}
      <section className="section">
        <h2>3 碼郵遞區號</h2>

        <div className="selector-group">
          <div className="selector">
            <label>縣市</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="selector">
            <label>行政區</label>
            <select value={district} onChange={e => setDistrict(e.target.value)}>
              {districts.map(d => (
                <option key={d.label} value={d.label}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="result">
          <div className="result-item">
            <span className="label">郵遞區號</span>
            <span className="value zipcode">{zipCode}</span>
          </div>
          <div className="result-item">
            <span className="label">完整地址</span>
            <span className="value">{zipCode} {city}{district}</span>
          </div>
        </div>

        {/* 行政區搜尋 */}
        <div className="search-section">
          <label>搜尋行政區</label>
          <input
            type="text"
            placeholder="輸入關鍵字，例如：中正"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.slice(0, 8).map(([zip, c, d]) => (
                <li
                  key={`${c}-${d}`}
                  onClick={() => {
                    setCity(c)
                    setDistrict(d)
                    setSearchKeyword('')
                  }}
                >
                  <span className="zip">{zip}</span> {c} {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 6 碼區塊 */}
      <section className="section">
        <h2>6 碼郵遞區號 (3+3)</h2>

        <div className="selector-group">
          <div className="selector">
            <label>縣市</label>
            <select value={city6} onChange={e => handleCity6Change(e.target.value)}>
              <option value="">請選擇</option>
              {cities6.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="selector">
            <label>行政區</label>
            <select value={area6} onChange={e => handleArea6Change(e.target.value)} disabled={!city6}>
              <option value="">請選擇</option>
              {areas6.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="selector">
            <label>路名</label>
            <select value={road6} onChange={e => setRoad6(e.target.value)} disabled={!area6}>
              <option value="">請選擇</option>
              {roads6.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="selector small">
            <label>門牌</label>
            <input
              type="number"
              placeholder="號"
              value={number6}
              onChange={e => setNumber6(e.target.value)}
              disabled={!road6}
            />
          </div>
        </div>

        {zip6Result && (
          <div className="result">
            <div className="result-item">
              <span className="label">6 碼郵遞區號</span>
              <span className="value zipcode">{zip6Result.zipcode}</span>
            </div>
            <div className="result-item">
              <span className="label">完整地址</span>
              <span className="value">
                {zip6Result.zipcode} {zip6Result.city}{zip6Result.area}{zip6Result.road}
                {number6 && `${number6}號`}
              </span>
            </div>
          </div>
        )}

        {/* 路名搜尋 */}
        <div className="search-section">
          <label>搜尋路名</label>
          <input
            type="text"
            placeholder="輸入關鍵字，例如：忠孝東路"
            value={searchRoad}
            onChange={e => setSearchRoad(e.target.value)}
          />
          {roadSearchResults.length > 0 && (
            <ul className="search-results">
              {roadSearchResults.map(r => (
                <li key={`${r.city}-${r.area}-${r.road}`} onClick={() => handleRoadSelect(r)}>
                  {r.city} {r.area} <strong>{r.road}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 6 碼 Lazy Load 區塊 */}
      <Zip6LazySection />

      <a
        className="github-link"
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
  const {
    loading,
    cities,
    areas,
    roads,
    city,
    area,
    road,
    number,
    setCity,
    setArea,
    setRoad,
    setNumber,
    zipCode,
    result,
  } = useTwZip6Lazy()

  return (
    <section className="section">
      <h2>6 碼 Lazy Load {loading && <span style={{ fontSize: '0.8rem', color: '#999' }}>(載入中...)</span>}</h2>

      <div className="selector-group">
        <div className="selector">
          <label>縣市</label>
          <select value={city} onChange={e => setCity(e.target.value)} disabled={loading}>
            <option value="">請選擇</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="selector">
          <label>行政區</label>
          <select value={area} onChange={e => setArea(e.target.value)} disabled={loading || !city}>
            <option value="">請選擇</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="selector">
          <label>路名</label>
          <select value={road} onChange={e => setRoad(e.target.value)} disabled={loading || !area}>
            <option value="">請選擇</option>
            {roads.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="selector small">
          <label>門牌</label>
          <input
            type="number"
            placeholder="號"
            value={number ?? ''}
            onChange={e => setNumber(e.target.value ? Number(e.target.value) : undefined)}
            disabled={loading || !road}
          />
        </div>
      </div>

      {result && (
        <div className="result">
          <div className="result-item">
            <span className="label">6 碼郵遞區號</span>
            <span className="value zipcode">{zipCode}</span>
          </div>
          <div className="result-item">
            <span className="label">完整地址</span>
            <span className="value">
              {result.zipcode} {result.city}{result.area}{result.road}
              {number && `${number}號`}
            </span>
          </div>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
        資料按縣市動態載入，初始僅 ~5KB
      </p>
    </section>
  )
}

export default App
