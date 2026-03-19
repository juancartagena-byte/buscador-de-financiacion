export function typeColor(t) {
  if (t === 'Nacional') return '#1e6b3a'
  if (t === 'Territorial') return '#8b5e1a'
  if (t === 'Privado') return '#1a5fa0'
  if (t === 'Otro') return '#6b7280'
  return '#4a2d82'
}

export function typeBg(t) {
  if (t === 'Nacional') return '#e8f5e9'
  if (t === 'Territorial') return '#fff3e0'
  if (t === 'Privado') return '#e0f0ff'
  if (t === 'Otro') return '#f0f0f0'
  return '#f3e5f5'
}

export function scoreColor(s) {
  return s >= 80 ? '#1b5e20' : s >= 60 ? '#e65100' : '#6a1b9a'
}

export function scoreBg(s) {
  return s >= 80 ? '#e8f5e9' : s >= 60 ? '#fff3e0' : '#f3e5f5'
}

export function formatBudgetDisplay(raw) {
  if (!raw || Number(raw) <= 0) return null
  const usd = Number(raw) / 4400
  const label =
    usd >= 1e6
      ? (usd / 1e6).toFixed(1) + 'M'
      : usd >= 1e3
        ? Math.round(usd / 1e3) + 'K'
        : Math.round(usd)
  return {
    cop: Number(raw).toLocaleString('es-CO'),
    usd: '≈ USD ' + label,
  }
}
