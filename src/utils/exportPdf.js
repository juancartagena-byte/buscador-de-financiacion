import { guides } from "../data/guides";
import { PROCS, BENS, OBJS } from "../data/constants";
import { typeColor, typeBg, scoreColor, scoreBg } from "./helpers";

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

function escRaw(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function field(label, value) {
  if (!value || value === "No especificado." || value === "No disponible." || value === "No se detalla.") return "";
  return `
    <div class="field">
      <div class="field-label">${escRaw(label)}</div>
      <div class="field-value">${esc(value)}</div>
    </div>`;
}

function field2(label, value) {
  if (!value || value === "No especificado." || value === "No disponible." || value === "No se detalla.") return "";
  return `
    <div class="info-card">
      <div class="dt">${escRaw(label)}</div>
      <div class="dd">${esc(value)}</div>
    </div>`;
}

function section(title, content) {
  if (!content || !content.trim()) return "";
  return `
    <div class="section">
      <div class="section-title">${escRaw(title)}</div>
      ${content}
    </div>`;
}

function coverageRow(label, active, color) {
  return active
    ? `<div class="cov-row"><span class="cov-yes" style="color:${color}">✓</span><span>${escRaw(label)}</span></div>`
    : `<div class="cov-row"><span class="cov-no">—</span><span class="cov-inactive">${escRaw(label)}</span></div>`;
}

// ── Renders fechas: string or array of {fecha_clave, hito_del_proceso, descripcion}
function renderFechas(fechas) {
  if (!fechas) return "";
  if (Array.isArray(fechas)) {
    const rows = fechas
      .map(
        (f) => `
      <tr>
        <td class="ft-fecha">${escRaw(f.fecha_clave)}</td>
        <td class="ft-hito">${escRaw(f.hito_del_proceso)}</td>
        <td>${escRaw(f.descripcion)}</td>
      </tr>`,
      )
      .join("");
    return `
      <table class="fechas-table">
        <thead><tr><th>Fecha</th><th>Hito</th><th>Descripción</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }
  return `<div class="field-value">${esc(fechas)}</div>`;
}

// ── Renders checklist text: lines starting with [  ] become checkbox items
function renderChecklist(text) {
  if (!text) return "";
  const lines = text.split("\n");
  const items = lines
    .map((line) => {
      if (!line.trim()) return "";
      if (line.trimStart().startsWith("[")) {
        const label = line.replace(/^\s*\[\s*\]\s*/, "");
        return `<div class="chk-item"><span class="chk-box"></span><span>${escRaw(label)}</span></div>`;
      }
      return `<div class="chk-header">${escRaw(line)}</div>`;
    })
    .join("");
  return `<div class="checklist">${items}</div>`;
}

// ── Guide section: handles both new schema (g.estado) and old schema (g.est)
function buildGuideSection(g, hasFullGuide) {
  if (!g) return "";

  if (hasFullGuide) {
    // New schema — skip eleg_org/eleg_proj/financiamiento/duracion (shown in Acceso/Financiamiento)
    const body = `
      <div class="guide-status-new">
        Estado: <strong>${escRaw(g.estado)}</strong>
      </div>
      ${g.ciclo ? field("Ciclo de la convocatoria", g.ciclo) : ""}
      ${g.proceso ? field("Proceso de aplicación", g.proceso) : ""}
      ${g.otros ? field("Otros requisitos", g.otros) : ""}
      ${
        g.fechas
          ? `<div class="field">
               <div class="field-label">Fechas clave</div>
               ${renderFechas(g.fechas)}
             </div>`
          : ""
      }
      ${
        g.checklist
          ? `<div class="field">
               <div class="field-label">Checklist de documentos</div>
               ${renderChecklist(g.checklist)}
             </div>`
          : ""
      }
      ${
        g.con
          ? `<div class="field">
               <div class="field-label">Contacto / Sitio web</div>
               <a href="${escRaw(g.con)}" class="link">${escRaw(g.con)}</a>
             </div>`
          : ""
      }`;
    return section("Guía de aplicación", body);
  }

  // Old schema
  const steps = (g.pasos || [])
    .map(
      (p, i) => `
      <div class="step">
        <div class="step-num">${i + 1}</div>
        <div>
          <strong>${escRaw(p.t)}</strong>
          <div class="step-desc">${escRaw(p.d)}</div>
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
             <a href="${escRaw(g.con)}" class="link">${escRaw(g.con)}</a>
           </div>`
        : ""
    }`;

  return section(
    "Guía paso a paso",
    `<div class="guide-status">Estado: <strong>${escRaw(g.est || "")}</strong></div>${steps}${meta}`,
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

  const hasFullGuide = g && g.estado !== undefined;

  // ── GENERAL
  // Info-grid: vig, modalidad, periodicidad, creacion
  const generalGrid = `
    <div class="info-grid">
      ${field2("Vigencia", fund.vig)}
      ${field2("Modalidad de acceso", fund.modalidad)}
      ${field2("Periodicidad", fund.periodicidad)}
      ${field2("Creación", fund.creacion || fund.fecha)}
    </div>`;

  const generalContent =
    field("Descripción", fund.desc) +
    field("Objetivos", fund.obj) +
    field("Entidad gestora", fund.ent) +
    field("Ciclo GRD", fund.ciclo) +
    field("Público objetivo", fund.pub) +
    field("Actividades financiables", fund.act) +
    field("Instrumentos de financiación", fund.inst) +
    generalGrid;

  // ── ACCESO
  // If full guide has eleg_org/eleg_proj, skip fund.eleg/fund.req (they are simpler versions)
  const accesoContent = hasFullGuide
    ? field("Elegibilidad de la organización", g.eleg_org) +
      field("Elegibilidad del proyecto", g.eleg_proj) +
      field("Criterios de asignación", fund.crit) +
      field("Cómo acceder", fund.acc)
    : field("Condiciones de elegibilidad", fund.eleg) +
      field("Requisitos", fund.req) +
      field("Criterios de asignación", fund.crit) +
      field("Cómo acceder", fund.acc) +
      field("Tiempo de aplicación", fund.tiem);

  // ── FINANCIAMIENTO
  // If full guide has financiamiento/duracion, use those instead of fund.mon/fund.tiem
  const financContent = hasFullGuide
    ? field("Financiamiento", g.financiamiento) +
      field("Duración", g.duracion) +
      `<div class="info-grid">
        ${field2("Capitalización", fund.cap)}
      </div>` +
      field("Subcuentas / Subcategorías", fund.sub)
    : field("Instrumentos de financiación", fund.inst) +
      `<div class="info-grid">
        ${field2("Monto máximo", fund.mon)}
        ${field2("Capitalización", fund.cap)}
      </div>` +
      field("Subcuentas / Subcategorías", fund.sub);

  // ── COBERTURA
  const procsRows = PROCS.map((l, i) => coverageRow(l, fund.p?.[i], "#1e6b3a")).join("");
  const bensRows  = BENS.map((l, i)  => coverageRow(l, fund.b?.[i], "#8b5e1a")).join("");
  const objsRows  = OBJS.map((l, i)  => coverageRow(l, fund.o?.[i], "#4a2d82")).join("");

  const coberturaContent = `
    <div class="coverage-group">
      <div class="cov-subtitle">Procesos GRD</div>${procsRows}
    </div>
    <div class="coverage-group" style="margin-top:12px">
      <div class="cov-subtitle">Beneficiarios</div>${bensRows}
    </div>
    <div class="coverage-group" style="margin-top:12px">
      <div class="cov-subtitle">Objetivos PNGRD</div>${objsRows}
    </div>`;

  // ── LEGAL (ent ya está en General)
  const legalContent =
    field("Normativa", fund.nor) +
    (fund.web
      ? `<div class="field">
           <div class="field-label">Sitio web oficial</div>
           <a href="${escRaw(fund.web)}" class="link">${escRaw(fund.web)}</a>
         </div>`
      : "");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${escRaw(fund.n)} — Buscador GRD</title>
<style>
  @page { size: A4; margin: 16mm 18mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a1a; line-height: 1.6; background: #fff; }

  /* Header */
  .doc-header { background: #1e6b3a; color: #fff; padding: 18px 22px; border-radius: 10px; margin-bottom: 18px; }
  .fund-type-tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.2); margin-bottom: 8px; }
  .fund-short-name { font-size: 20px; font-weight: 700; font-family: Georgia, serif; margin-bottom: 2px; }
  .fund-full-name { font-size: 12px; opacity: 0.85; }

  /* Match block */
  .match-block { display: flex; align-items: flex-start; gap: 14px; border-left: 4px solid ${sc}; background: ${sb}; padding: 12px 16px; border-radius: 8px; margin-bottom: 18px; }
  .score-ring { flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; background: ${sc}; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; line-height: 1.1; }
  .score-ring-label { font-size: 8px; font-weight: 600; letter-spacing: .05em; opacity: 0.85; }
  .match-reason { font-size: 13px; color: #1a1a1a; padding-top: 2px; }

  /* Sections */
  .section { margin-bottom: 18px; page-break-inside: avoid; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; margin-bottom: 10px; page-break-after: avoid; }

  /* Fields */
  .field { margin-bottom: 9px; }
  .field-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #9e9e9e; margin-bottom: 2px; }
  .field-value { font-size: 13px; color: #1a1a1a; }

  /* 2-col info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; margin-bottom: 9px; }
  .info-card { background: #f5f5f3; border-radius: 8px; padding: 8px 12px; }
  .dt { font-size: 10px; color: #9e9e9e; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
  .dd { font-size: 13px; font-weight: 600; color: #1a1a1a; }

  /* Guide — new schema */
  .guide-status-new { font-size: 12px; background: #f0f7f3; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; color: #1e6b3a; font-weight: 600; }

  /* Guide — old schema */
  .guide-status { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
  .step { display: flex; gap: 10px; margin-bottom: 10px; page-break-inside: avoid; }
  .step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #1e6b3a; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .step-desc { font-size: 12px; color: #4b5563; margin-top: 2px; }

  /* Fechas table */
  .fechas-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
  .fechas-table th { text-align: left; padding: 6px 10px; background: #f0f7f3; color: #1e6b3a; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; border-bottom: 2px solid #c8e6d4; }
  .fechas-table td { padding: 6px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  .ft-fecha { font-weight: 600; color: #1e6b3a; white-space: nowrap; }
  .ft-hito { font-weight: 600; white-space: nowrap; }

  /* Checklist */
  .checklist { display: flex; flex-direction: column; gap: 3px; margin-top: 6px; }
  .chk-header { font-size: 11px; font-weight: 700; color: #1e6b3a; margin-top: 8px; margin-bottom: 2px; }
  .chk-item { display: flex; align-items: flex-start; gap: 8px; padding: 5px 10px; background: #f9f9f7; border: 1px solid #eee; border-radius: 5px; font-size: 12px; }
  .chk-box { flex-shrink: 0; width: 13px; height: 13px; border: 2px solid #1e6b3a; border-radius: 3px; margin-top: 1px; display: inline-block; }

  /* Coverage */
  .coverage-group { page-break-inside: avoid; }
  .cov-subtitle { font-size: 11px; font-weight: 700; color: #4b5563; margin-bottom: 4px; }
  .cov-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 12px; }
  .cov-yes { font-weight: 700; }
  .cov-no  { color: #d1d5db; }
  .cov-inactive { color: #9e9e9e; }

  /* Link */
  .link { color: #1e6b3a; text-decoration: underline; font-size: 12px; word-break: break-all; }

  /* Footer */
  .doc-footer { margin-top: 28px; padding-top: 10px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #9e9e9e; text-align: center; }

  @media print {
    body, .doc-header, .match-block, .score-ring, .step-num, .info-card,
    .guide-status-new, .fechas-table th, .chk-item
    { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

  <div class="doc-header">
    <div class="fund-type-tag" style="background:${tb};color:${tc}">${escRaw(fund.t)}</div>
    <div class="fund-short-name">${escRaw(fund.n)}</div>
    ${fund.s && fund.s !== fund.n ? `<div class="fund-full-name">${escRaw(fund.s)}</div>` : ""}
  </div>

  <div class="match-block">
    <div class="score-ring">
      <span>${result.score}</span>
      <span class="score-ring-label">MATCH</span>
    </div>
    <div class="match-reason">${escRaw(result.reason)}</div>
  </div>

  ${section("General", generalContent)}
  ${section("Acceso y Elegibilidad", accesoContent)}
  ${section("Financiamiento", financContent)}
  ${buildGuideSection(g, hasFullGuide)}
  ${section("Cobertura", coberturaContent)}
  ${section("Legal", legalContent)}

  <div class="doc-footer">
    Generado por Buscador de Financiación GRD · ${escRaw(date)}
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
