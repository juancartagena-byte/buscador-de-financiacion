import { useState, useRef } from 'react'
import { suggestions } from '../data/constants'
import { funds } from '../data/funds'
import { aiSearch, localSearch } from '../utils/search'
import { formatBudgetDisplay, typeColor } from '../utils/helpers'
import ResultCard from './ResultCard'

export default function SearchPage({ openPanel }) {
  const [searchState, setSearchState] = useState('home') // 'home' | 'loading' | 'results'
  const [query, setQuery] = useState('')
  const [budget, setBudget] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  function autoGrow(el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  function handleBudgetChange(e) {
    let v = e.target.value.replace(/[^0-9]/g, '')
    if (v) v = Number(v).toLocaleString('es-CO')
    setBudget(v)
  }

  const rawBudget = budget.replace(/[^0-9]/g, '')
  const budgetDisplay = formatBudgetDisplay(rawBudget)

  async function doSearch(queryOverride) {
    const q = queryOverride || query
    if (!q.trim()) return
    if (queryOverride) setQuery(queryOverride)

    setSearchState('loading')
    setLoading(true)

    try {
      const data = await aiSearch(q, rawBudget)
      setResults(data)
    } catch {
      setResults(localSearch(q))
    }

    setSearchState('results')
    setLoading(false)
  }

  function goHome() {
    setSearchState('home')
    setQuery('')
    setBudget('')
    setResults(null)
  }

  const resultFunds = results
    ? (results.funds || []).map((r) => ({ result: r, fund: funds.find((f) => f.id === r.id) })).filter((x) => x.fund)
    : []

  return (
    <div
      id="busquedaPage"
      style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Hero + Search card always visible */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>
        {searchState === 'home' && (
          <div className="hero">
            <h1>Encuentra la <em>fuente ideal</em> para tu necesidad</h1>
            <p>Describe tu situación en lenguaje natural y te mostraremos las 8 fuentes de financiación más compatibles con tu solicitud.</p>
          </div>
        )}

        <div className="search-card">
          <label className="search-label" htmlFor="queryInput">Describe tu necesidad de financiación</label>
          <textarea
            id="queryInput"
            ref={textareaRef}
            rows={3}
            placeholder="Ej: Soy una alcaldía que necesita fondos para sistemas de alerta temprana en un municipio afectado por inundaciones..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); autoGrow(e.target) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSearch() } }}
          />

          {searchState === 'home' && (
            <div className="suggestions" id="suggestionsSection">
              <div className="suggestions-label">Ejemplos de consulta</div>
              <div className="suggestions-wrap">
                {suggestions.map((s, i) => (
                  <button key={i} className="suggestion-chip" onClick={() => doSearch(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="search-card-row">
            <div className="filter-budget-wrap">
              <span className={`prefix${rawBudget ? ' active' : ''}`}>COP $</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Presupuesto requerido (opcional)"
                value={budget}
                onChange={handleBudgetChange}
                className={rawBudget ? 'active' : ''}
              />
              {budgetDisplay && (
                <span className="usd-hint">{budgetDisplay.usd}</span>
              )}
            </div>
            <button
              className="search-btn"
              onClick={() => doSearch()}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Buscar fuentes
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {searchState === 'loading' && (
        <div className="loading-section">
          <div className="loading-spinner" />
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Analizando tu consulta con IA...</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 8 }}>Comparando con 32 fuentes de financiación</p>
        </div>
      )}

      {/* Results */}
      {searchState === 'results' && results && (
        <div className="results-section">
          {budgetDisplay && (
            <div className="filter-pills">
              <span className="filter-pill">💰 COP ${budgetDisplay.cop} {budgetDisplay.usd}</span>
            </div>
          )}
          <div className="results-count">{resultFunds.length} fondos recomendados</div>
          {resultFunds.map(({ result, fund }, i) => (
            <ResultCard key={fund.id} result={result} fund={fund} index={i} onClick={openPanel} />
          ))}
          <button className="new-search-btn" onClick={goHome}>Nueva búsqueda</button>
        </div>
      )}
    </div>
  )
}
