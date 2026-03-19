import { funds } from '../data/funds'

export function localSearch(query) {
  const kw = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2)

  const scored = funds
    .map((f) => {
      let sc = 0
      const hay = (f.n + ' ' + f.act + ' ' + f.pub + ' ' + f.ciclo + ' ' + f.inst + ' ' + f.obj)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      kw.forEach((k) => { if (hay.includes(k)) sc += 15 })
      return {
        id: f.id,
        score: Math.min(100, Math.max(0, sc)),
        reason: 'Coincidencia por: ' + kw.filter((k) => hay.includes(k)).join(', '),
      }
    })
    .filter((r) => r.score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  return {
    summary:
      'Se encontraron ' +
      scored.length +
      ' fondos relevantes para tu consulta. Los resultados se basan en coincidencia de palabras clave con las 32 fuentes disponibles.',
    funds: scored,
  }
}

export async function aiSearch(query, budget) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key')

  const summ = funds
    .map((f) => `[${f.id}] ${f.n} | ${f.t} | ${f.act} | ${f.pub} | Monto: ${f.mon}`)
    .join('\n')

  let msg = query
  if (budget && Number(budget) > 0) {
    const usd = Number(budget) / 4400
    const label =
      usd >= 1e6
        ? (usd / 1e6).toFixed(1) + 'M'
        : usd >= 1e3
          ? Math.round(usd / 1e3) + 'K'
          : Math.round(usd)
    msg +=
      '\n\n[FILTRO] Presupuesto: COP $' +
      Number(budget).toLocaleString('es-CO') +
      ' (≈ USD ' + label + '). Prioriza fondos con monto compatible.'
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system:
        'Eres experto en financiamiento para GRD y cambio climático en Colombia. Recomienda fondos relevantes.\n\nFONDOS:\n' +
        summ +
        '\n\nINSTRUCCIONES:\n1. Analiza quién es, qué necesita.\n2. Respeta FILTROS si los hay.\n3. Máx 8 fondos.\n4. Solo JSON, sin markdown.\n\nFORMATO:\n{"summary":"Resumen en español","funds":[{"id":"F01","score":95,"reason":"Razón"}]}\n\nScore 0-100. Solo >40.',
      messages: [{ role: 'user', content: msg }],
    }),
  })

  if (!r.ok) throw new Error('HTTP ' + r.status)
  const d = await r.json()
  const txt = (d.content || []).map((i) => i.text || '').join('')
  let clean = txt.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const m = clean.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('No JSON')
  const jsonStr = m[0].replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\s{2,}/g, ' ')
  return JSON.parse(jsonStr)
}
