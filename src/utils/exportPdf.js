import { guides } from "../data/guides";
import { PROCS, BENS, OBJS } from "../data/constants";
import { typeColor, typeBg, scoreColor, scoreBg } from "./helpers";

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function field(label, value) {
  if (!value) return "";
  return `
    <div class="field">
      <div class="field-label">${esc(label)}</div>
      <div class="field-value">${esc(value)}</div>
    </div>`;
}

function field2(label, value) {
  if (!value) return "";
  return `
    <div class="info-card">
      <div class="dt">${esc(label)}</div>
      <div class="dd">${esc(value)}</div>
    </div>`;
}

function section(title, content) {
  if (!content.trim()) return "";
  return `
    <div class="section">
      <div class="section-title">${esc(title)}</div>
      ${content}
    </div>`;
}

function coverageRow(label, active, color) {
  return active
    ? `<div class="cov-row"><span class="cov-yes" style="color:${color}">✓</span><span>${esc(label)}</span></div>`
    : `<div class="cov-row"><span class="cov-no">—</span><span class="cov-inactive">${esc(label)}</span></div>`;
}

function buildGuideSection(g) {
  if (!g) return "";
  const steps = (g.pasos || [])
    .map(
      (p, i) => `
      <div class="step">
        <div class="step-num">${i + 1}</div>
        <div>
          <strong>${esc(p.t)}</strong>
          <div class="step-desc">${esc(p.d)}</div>
        </div>
      </div>`,
    )
    .join("");

  const meta = `
    <div class="info-grid" style="margin-top:12px">
      ${g.mon ? field2("Monto", g.mon) : ""}
      ${g.dur ? field2("Duración", g.dur) : ""}
    </div>
    ${
      g.con
        ? `<div class="field" style="margin-top:10px">
        <div class="field-label">Contacto / Sitio web</div>
        <a href="${esc(g.con)}" class="link">${esc(g.con)}</a>
      </div>`
        : ""
    }`;

  return section(
    "Guía paso a paso",
    `<div class="guide-status">Estado: <strong>${esc(g.est || "")}</strong></div>${steps}${meta}`,
  );
}

function buildHtml(result, fund, g) {
  const sc = scoreColor(result.score);
  const sb = scoreBg(result.score);
  const tc = typeColor(fund.t);
  const tb = typeBg(fund.t);
  const date = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const procsRows = PROCS.map((l, i) =>
    coverageRow(l, fund.p?.[i], "#1e6b3a"),
  ).join("");
  const bensRows = BENS.map((l, i) =>
    coverageRow(l, fund.b?.[i], "#8b5e1a"),
  ).join("");
  const objsRows = OBJS.map((l, i) =>
    coverageRow(l, fund.o?.[i], "#4a2d82"),
  ).join("");

  const generalContent =
    field("Descripción", fund.desc) +
    field("Objetivos", fund.obj) +
    field("Ciclo GRD", fund.ciclo) +
    field("Público objetivo", fund.pub) +
    field("Actividades financiables", fund.act) +
    `<div class="info-grid">
      ${field2("Vigencia", fund.vig)}
      ${field2("Fecha de registro", fund.fecha)}
    </div>`;

  const accesoContent =
    field("Elegibilidad", fund.eleg) +
    field("Requisitos", fund.req) +
    field("Criterios de asignación", fund.crit) +
    field("Cómo acceder", fund.acc) +
    field("Tiempos", fund.tiem);

  const financContent =
    field("Instrumentos de financiación", fund.inst) +
    `<div class="info-grid">
      ${field2("Monto máximo", fund.mon)}
      ${field2("Capitalización", fund.cap)}
    </div>` +
    field("Subcuentas / Subcategorías", fund.sub);

  const coberturaContent = `
    <div class="coverage-group">
      <div class="cov-subtitle">Procesos GRD</div>
      ${procsRows}
    </div>
    <div class="coverage-group" style="margin-top:12px">
      <div class="cov-subtitle">Beneficiarios</div>
      ${bensRows}
    </div>
    <div class="coverage-group" style="margin-top:12px">
      <div class="cov-subtitle">Objetivos PNGRD</div>
      ${objsRows}
    </div>`;

  const legalContent =
    field("Entidad gestora", fund.ent) +
    field("Normativa", fund.nor) +
    (fund.web
      ? `<div class="field">
        <div class="field-label">Sitio web oficial</div>
        <a href="${esc(fund.web)}" class="link">${esc(fund.web)}</a>
      </div>`
      : "");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(fund.n)} — Buscador GRD</title>
<style>
  @page { size: A4; margin: 18mm 18mm; }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
    color: #1a1a1a;
    line-height: 1.6;
    background: #fff;
  }

  /* Header */
  .doc-header {
    background: #1e6b3a;
    color: #fff;
    padding: 18px 22px;
    border-radius: 10px;
    margin-bottom: 18px;
  }
  .fund-type-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    background: rgba(255,255,255,0.2);
    margin-bottom: 8px;
  }
  .fund-short-name {
    font-size: 20px;
    font-weight: 700;
    font-family: Georgia, serif;
    margin-bottom: 2px;
  }
  .fund-full-name {
    font-size: 12px;
    opacity: 0.85;
  }

  /* Match block */
  .match-block {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    border-left: 4px solid ${sc};
    background: ${sb};
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 18px;
  }
  .score-ring {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${sc};
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    line-height: 1.1;
  }
  .score-ring-label {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: .05em;
    opacity: 0.85;
  }
  .match-reason {
    font-size: 13px;
    color: #1a1a1a;
    padding-top: 2px;
  }

  /* Sections */
  .section {
    margin-bottom: 16px;
    page-break-inside: avoid;
  }
  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #6b7280;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 4px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }

  /* Fields */
  .field {
    margin-bottom: 9px;
  }
  .field-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: #9e9e9e;
    margin-bottom: 2px;
  }
  .field-value {
    font-size: 13px;
    color: #1a1a1a;
  }

  /* 2-col info grid */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 6px;
    margin-bottom: 9px;
  }
  .info-card {
    background: #f5f5f3;
    border-radius: 8px;
    padding: 8px 12px;
  }
  .dt {
    font-size: 10px;
    color: #9e9e9e;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 2px;
  }
  .dd {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
  }

  /* Guide */
  .guide-status {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 10px;
  }
  .step {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    page-break-inside: avoid;
  }
  .step-num {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #1e6b3a;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .step-desc {
    font-size: 12px;
    color: #4b5563;
    margin-top: 2px;
  }

  /* Coverage */
  .coverage-group {
    page-break-inside: avoid;
  }
  .cov-subtitle {
    font-size: 11px;
    font-weight: 700;
    color: #4b5563;
    margin-bottom: 4px;
  }
  .cov-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    font-size: 12px;
  }
  .cov-yes { font-weight: 700; }
  .cov-no  { color: #d1d5db; }
  .cov-inactive { color: #9e9e9e; }

  /* Link */
  .link {
    color: #1e6b3a;
    text-decoration: underline;
    font-size: 12px;
    word-break: break-all;
  }

  /* Footer */
  .doc-footer {
    margin-top: 28px;
    padding-top: 10px;
    border-top: 1px solid #e5e5e5;
    font-size: 10px;
    color: #9e9e9e;
    text-align: center;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .match-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .score-ring { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .step-num { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .info-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="doc-header">
    <div class="fund-type-tag" style="background:${tb};color:${tc}">${esc(fund.t)}</div>
    <div class="fund-short-name">${esc(fund.n)}</div>
    ${fund.s ? `<div class="fund-full-name">${esc(fund.s)}</div>` : ""}
  </div>

  <!-- Coincidencia -->
  <div class="match-block">
    <div class="score-ring">
      <span>${result.score}</span>
      <span class="score-ring-label">MATCH</span>
    </div>
    <div class="match-reason">${esc(result.reason)}</div>
  </div>

  ${section("General", generalContent)}
  ${section("Acceso", accesoContent)}
  ${section("Financiamiento", financContent)}
  ${buildGuideSection(g)}
  ${section("Cobertura", coberturaContent)}
  ${section("Legal", legalContent)}

  <div class="doc-footer">
    Generado por Buscador de Financiación GRD · ${esc(date)}
  </div>

</body>
</html>`;
}

export function exportFundPdf(result, fund) {
  const g = guides[fund.id];
  const html = buildHtml(result, fund, g);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert(
      "El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio e intenta de nuevo.",
    );
    return;
  }
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}
