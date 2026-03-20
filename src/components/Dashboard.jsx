import { useEffect, useRef, useState } from "react";
import { funds } from "../data/funds";
import { typeColor, typeBg } from "../utils/helpers";

const PIE_DATA = [
  { label: "Nacional", color: "#1e6b3a" },
  { label: "Territorial", color: "#c4872a" },
  { label: "Internacional", color: "#4a2d82" },
  { label: "Privado", color: "#1a5fa0" },
  { label: "Otro", color: "#6b7280" },
];

const BAR_COLORS = ["#1e6b3a", "#22863a", "#8b5e1a", "#b97a2b", "#4a2d82"];
const BAR_LABELS = [
  "Conocimiento",
  "Reducción",
  "Preparación / Respuesta",
  "Recuperación / Rehabilitación",
  "Otros",
];

export default function Dashboard({ openPanel }) {
  const barRef = useRef(null);
  const pieRef = useRef(null);
  // stores slice metadata for hit-testing: [{label, startAngle, endAngle, cx, cy, r, inner}]
  const pieSlicesRef = useRef([]);

  const [selectedType, setSelectedType] = useState(null);

  const total = funds.length;
  const nacCount = funds.filter((f) => f.t === "Nacional").length;
  const terCount = funds.filter((f) => f.t === "Territorial").length;
  const intCount = funds.filter((f) => f.t === "Internacional").length;
  const prvCount = funds.filter((f) => f.t === "Privado").length;
  const otrCount = funds.filter((f) => f.t === "Otro").length;

  const filteredFunds = selectedType
    ? funds.filter((f) => f.t === selectedType)
    : funds;

  // Redraw bar chart when filter changes
  useEffect(() => {
    if (barRef.current) drawBarChart(barRef.current, filteredFunds);
  }, [selectedType]);

  // Draw pie chart once on mount
  useEffect(() => {
    if (pieRef.current) drawPieChart(pieRef.current, selectedType);
  }, []);

  // Redraw pie chart when selection changes (to reflect highlight)
  useEffect(() => {
    if (pieRef.current) drawPieChart(pieRef.current, selectedType);
  }, [selectedType]);

  // ── Click handler for pie chart ──
  useEffect(() => {
    const canvas = pieRef.current;
    if (!canvas) return;

    function handleClick(e) {
      const rect = canvas.getBoundingClientRect();
      // mouse coords in CSS pixels relative to canvas
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const slice of pieSlicesRef.current) {
        const dx = mx - slice.cx;
        const dy = my - slice.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < slice.inner || dist > slice.r) continue;

        let angle = Math.atan2(dy, dx);
        // normalize to [startAngle, startAngle + 2π] range
        while (angle < slice.startAngle) angle += Math.PI * 2;
        if (angle <= slice.endAngle) {
          setSelectedType((prev) =>
            prev === slice.label ? null : slice.label,
          );
          return;
        }
      }
      // click outside any slice → clear filter
      setSelectedType(null);
    }

    canvas.addEventListener("click", handleClick);
    canvas.style.cursor = "pointer";
    return () => canvas.removeEventListener("click", handleClick);
  }, []);

  // ── Draw bar chart ──
  function drawBarChart(canvas, data) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth - 56;
    const h = 300;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const counts = BAR_LABELS.map(
      (_, i) => data.filter((f) => f.p[i] === 1).length,
    );
    const maxVal = Math.max(...counts, 1);

    const pad = { t: 12, r: 50, b: 12, l: 180 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;
    const barH = Math.min(36, ch / BAR_LABELS.length - 12);
    const gap = (ch - barH * BAR_LABELS.length) / (BAR_LABELS.length + 1);

    // Grid lines
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = pad.l + cw * (i / 4);
      ctx.beginPath();
      ctx.moveTo(x, pad.t);
      ctx.lineTo(x, h - pad.b);
      ctx.stroke();
      if (i > 0) {
        ctx.fillStyle = "#bbb";
        ctx.font = "10px 'Source Sans 3',sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(Math.round((maxVal * i) / 4), x, h - pad.b + 12);
      }
    }

    counts.forEach((val, i) => {
      const y = pad.t + gap + (barH + gap) * i;
      const barW = val > 0 ? (val / maxVal) * cw : 0;
      const x = pad.l;
      const r = 6;

      ctx.fillStyle = BAR_COLORS[i];
      if (barW > r * 2) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + barW - r, y);
        ctx.arcTo(x + barW, y, x + barW, y + r, r);
        ctx.arcTo(x + barW, y + barH, x + barW - r, y + barH, r);
        ctx.lineTo(x, y + barH);
        ctx.closePath();
        ctx.fill();
      } else if (barW > 0) {
        ctx.fillRect(x, y, barW, barH);
      }

      // Value label
      ctx.fillStyle = BAR_COLORS[i];
      ctx.font = "bold 14px 'Fraunces',serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(val, x + barW + 10, y + barH / 2);

      // Category label
      ctx.fillStyle = "#374151";
      ctx.font = "13px 'Source Sans 3',sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(BAR_LABELS[i], pad.l - 14, y + barH / 2);
    });
    ctx.textBaseline = "alphabetic";
  }

  // ── Draw pie chart ──
  function drawPieChart(canvas, activeLabel) {
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth - 56;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const data = PIE_DATA.map((d) => ({
      ...d,
      count: funds.filter((f) => f.t === d.label).length,
    })).filter((d) => d.count > 0);
    const tot = data.reduce((s, d) => s + d.count, 0);

    const cx = w * 0.38;
    const cy = h / 2;
    const radius = Math.min(cx - 20, cy - 20, 100);
    const inner = radius * 0.55;
    const EXPLODE = 8; // px offset for selected slice

    pieSlicesRef.current = [];
    let angle = -Math.PI / 2;

    data.forEach((d) => {
      const slice = (d.count / tot) * Math.PI * 2;
      const isActive = activeLabel === d.label;
      const midAngle = angle + slice / 2;

      // Explode selected slice outward
      const ox = isActive ? Math.cos(midAngle) * EXPLODE : 0;
      const oy = isActive ? Math.sin(midAngle) * EXPLODE : 0;

      ctx.beginPath();
      ctx.moveTo(
        cx + ox + inner * Math.cos(angle),
        cy + oy + inner * Math.sin(angle),
      );
      ctx.arc(cx + ox, cy + oy, radius, angle, angle + slice);
      ctx.arc(cx + ox, cy + oy, inner, angle + slice, angle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.globalAlpha = activeLabel && !isActive ? 0.35 : 1;
      ctx.fill();

      // Stroke for selected
      if (isActive) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Store slice for hit-testing (use original cx/cy, not offset, for simpler math)
      pieSlicesRef.current.push({
        label: d.label,
        startAngle: angle,
        endAngle: angle + slice,
        cx,
        cy,
        r: radius + EXPLODE + 4,
        inner: inner - 4,
      });

      angle += slice;
    });

    // Center text
    const centerLabel = activeLabel
      ? funds.filter((f) => f.t === activeLabel).length.toString()
      : tot.toString();
    const centerSub = activeLabel ? activeLabel.toLowerCase() : "fuentes";

    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 28px 'Fraunces',serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(centerLabel, cx, cy - 6);
    ctx.fillStyle = "#9e9e9e";
    ctx.font = "12px 'Source Sans 3',sans-serif";
    ctx.fillText(centerSub, cx, cy + 14);

    // Legend
    const lx = w * 0.68;
    let ly = h / 2 - data.length * 22;
    data.forEach((d) => {
      const isActive = activeLabel === d.label;
      const pct = Math.round((d.count / tot) * 100);

      ctx.globalAlpha = activeLabel && !isActive ? 0.35 : 1;

      ctx.beginPath();
      ctx.arc(lx, ly + 6, isActive ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();

      ctx.fillStyle = "#1a1a1a";
      ctx.font = isActive
        ? "bold 13px 'Source Sans 3',sans-serif"
        : "13px 'Source Sans 3',sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${d.label} (${d.count})`, lx + 18, ly + 6);
      ctx.fillStyle = "#9e9e9e";
      ctx.font = "11px 'Source Sans 3',sans-serif";
      ctx.fillText(pct + "%", lx + 18, ly + 20);

      ctx.globalAlpha = 1;
      ly += 44;
    });
    ctx.textBaseline = "alphabetic";
  }

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      <div className="dash-container">
        <div className="dash-header">
          <h1>
            Dashboard de <em>Fuentes</em>
          </h1>
          <p>
            Resumen analítico de las {total} fuentes de financiación para
            gestión del riesgo y cambio climático disponibles en el sistema.
          </p>
        </div>

        {/* Summary cards */}
        <div className="dash-cards">
          {[
            {
              num: total,
              lbl: "Total de fuentes",
              color: "var(--green)",
              w: 100,
            },
            {
              num: nacCount,
              lbl: "Nacionales",
              color: "#1e6b3a",
              w: (nacCount / total) * 100,
            },
            {
              num: terCount,
              lbl: "Territoriales",
              color: "#8b5e1a",
              w: (terCount / total) * 100,
            },
            {
              num: intCount,
              lbl: "Internacionales",
              color: "#4a2d82",
              w: (intCount / total) * 100,
            },
            {
              num: prvCount + otrCount,
              lbl: "Privado / Otro",
              color: "#1a5fa0",
              w: ((prvCount + otrCount) / total) * 100,
            },
          ].map((s) => (
            <div className="dash-stat" key={s.lbl}>
              <div className="num" style={{ color: s.color }}>
                {s.num}
              </div>
              <div className="lbl">{s.lbl}</div>
              <div
                className="bar"
                style={{ background: s.color, width: s.w + "%" }}
              />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="dash-charts">
          {/* Bar chart — reacts to filter */}
          <div className="dash-chart-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <h3>Fuentes por Fase del Ciclo GRD</h3>
              {selectedType && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    background: typeBg(selectedType),
                    color: typeColor(selectedType),
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedType}
                </span>
              )}
            </div>
            <p className="dash-chart-sub">
              {selectedType
                ? `${filteredFunds.length} fuentes de tipo "${selectedType}"`
                : "Cantidad de fondos que cubren cada proceso de gestión del riesgo"}
            </p>
            <canvas ref={barRef} />
          </div>

          {/* Pie chart — drives the filter */}
          <div className="dash-chart-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 4,
              }}
            >
              <h3>Distribución por Tipo de Fuente</h3>
              {selectedType && (
                <button
                  onClick={() => setSelectedType(null)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    border: "1px solid #e0e0e0",
                    borderRadius: 20,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#666",
                    whiteSpace: "nowrap",
                  }}
                >
                  × Quitar filtro
                </button>
              )}
            </div>
            <p className="dash-chart-sub">
              {selectedType
                ? "Haz clic en el mismo sector para deseleccionar"
                : "Haz clic en un sector para filtrar el gráfico de la izquierda"}
            </p>
            <canvas ref={pieRef} />
          </div>
        </div>

        {/* Table — also filtered */}
        <div className="dash-table-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={{ marginBottom: 0 }}>
              {selectedType ? `Fuentes — ${selectedType}` : "Todas las fuentes"}
            </h3>
            {selectedType && (
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {filteredFunds.length} de {total}
              </span>
            )}
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredFunds.map((f) => (
                  <tr
                    key={f.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => openPanel(f.id)}
                  >
                    <td style={{ fontWeight: 700, color: "var(--text-light)" }}>
                      {f.id}
                    </td>
                    <td>
                      <strong>{f.s}</strong>
                      <br />
                      <span
                        style={{ fontSize: 12, color: "var(--text-muted)" }}
                      >
                        {f.n}
                      </span>
                    </td>
                    <td>
                      <span
                        className="tipo-badge"
                        style={{
                          background: typeBg(f.t),
                          color: typeColor(f.t),
                        }}
                      >
                        {f.t}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{f.mon}</td>
                    <td>{f.vig}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
