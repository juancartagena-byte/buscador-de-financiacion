import { useEffect, useState } from 'react'
import { funds } from '../data/funds'

export default function Nav({ page, setPage, goHome }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function handleLogoClick() {
    setPage('busqueda')
    goHome()
  }

  function handleTabClick(tab) {
    setPage(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className={`nav${scrolled || page === 'dashboard' ? ' scrolled' : ''}`}>
      <div className="nav-logo" onClick={handleLogoClick}>
        <div className="icon">BF</div>
        <span>Buscador de Financiación</span>
      </div>
      <div className="nav-tabs">
        <button
          className={`nav-tab${page === 'busqueda' ? ' active' : ''}`}
          onClick={() => handleTabClick('busqueda')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Búsqueda
        </button>
        <button
          className={`nav-tab${page === 'dashboard' ? ' active' : ''}`}
          onClick={() => handleTabClick('dashboard')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </button>
      </div>
      <span className="nav-badge">{funds.length} fuentes GRD · Colombia</span>
    </nav>
  )
}
