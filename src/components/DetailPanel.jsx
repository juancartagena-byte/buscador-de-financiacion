import { useState, useEffect } from "react";
import { PROCS, BENS, OBJS } from "../data/constants";
import { guides } from "../data/guides";
import { typeColor, typeBg } from "../utils/helpers";

const TABS = [
  { k: "general", l: "General" },
  { k: "acceso", l: "📋 Acceso" },
  { k: "guia", l: "Paso a paso" },
  { k: "fin", l: "Financiamiento" },
  { k: "cob", l: "Cobertura" },
  { k: "legal", l: "Legal" },
];

export default function DetailPanel({ fund, closePanel }) {
  const [tab, setTab] = useState("general");

  useEffect(() => {
    setTab("general");
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fund]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closePanel]);

  const g = guides[fund.id];

  function renderContent() {
    if (tab === "general")
      return (
        <>
          <div className="panel-section">
            <div className="panel-section-title">Descripción</div>
            <div className="text">{fund.desc}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Objetivos</div>
            <div className="text">{fund.obj}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Ciclo GRD</div>
            <div className="text">{fund.ciclo}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Público Objetivo</div>
            <div className="text">{fund.pub}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Actividades Apoyadas</div>
            <div className="text">{fund.act}</div>
          </div>
          <div className="info-grid" style={{ marginTop: 4 }}>
            <div className="info-card">
              <div className="dt">Vigencia</div>
              <div className="dd">{fund.vig}</div>
            </div>
            <div className="info-card">
              <div className="dt">Fecha de Creación</div>
              <div className="dd">{fund.fecha || "No disponible."}</div>
            </div>
          </div>
        </>
      );

    if (tab === "acceso")
      return (
        <>
          <div className="panel-section">
            <div className="panel-section-title">
              Condiciones de Elegibilidad
            </div>
            <div className="text">{fund.eleg}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Requisitos</div>
            <div className="text">{fund.req}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Criterios de Asignación</div>
            <div className="text">{fund.crit || "No especificado."}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Cómo Acceder</div>
            <div className="text">{fund.acc}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Tiempo de Aplicación</div>
            <div className="text">{fund.tiem}</div>
          </div>
        </>
      );

    if (tab === "guia") {
      if (!g)
        return (
          <p style={{ color: "#999" }}>Guía no disponible para este fondo.</p>
        );
      return (
        <>
          <div className="guide-status">
            <span className="emoji">📡</span>
            <div>
              <div className="label">Estado</div>
              <div className="value">{g.est}</div>
            </div>
          </div>
          <div className="panel-section-title" style={{ marginBottom: 16 }}>
            Paso a paso
          </div>
          {g.pasos.map((p, i) => (
            <div className="step-item" key={i}>
              <div className="step-num">{i + 1}</div>
              <div>
                <div className="step-title">{p.t}</div>
                <div className="step-desc">{p.d}</div>
              </div>
            </div>
          ))}
          <div
            className="info-grid"
            style={{
              marginTop: 24,
              borderTop: "1px solid var(--border-light)",
              paddingTop: 20,
            }}
          >
            <div className="info-card">
              <div className="dt">💰 Monto</div>
              <div className="dd">{g.mon}</div>
            </div>
            <div className="info-card">
              <div className="dt">⏱️ Duración</div>
              <div className="dd">{g.dur}</div>
            </div>
          </div>
          <div className="info-card" style={{ marginTop: 12 }}>
            <div className="dt">📞 Contacto</div>
            <div className="dd">{g.con}</div>
          </div>
        </>
      );
    }

    if (tab === "fin")
      return (
        <>
          <div className="panel-section">
            <div className="panel-section-title">
              Instrumentos de Financiación
            </div>
            <div className="text">{fund.inst}</div>
          </div>
          <div className="info-grid">
            <div className="info-card">
              <div className="dt">Monto Máximo</div>
              <div className="dd">{fund.mon}</div>
            </div>
            <div className="info-card">
              <div className="dt">Capitalización</div>
              <div className="dd">{fund.cap}</div>
            </div>
          </div>
          <div className="panel-section" style={{ marginTop: 16 }}>
            <div className="panel-section-title">Subcuentas</div>
            <div className="text">
              {fund.sub || "No se encontró información."}
            </div>
          </div>
        </>
      );

    if (tab === "cob") {
      const groups = [
        { title: "Procesos GRD", labels: PROCS, arr: fund.p, color: "#1e6b3a" },
        { title: "Beneficiarios", labels: BENS, arr: fund.b, color: "#8b5e1a" },
        {
          title: "Objetivos PNGRD",
          labels: OBJS,
          arr: fund.o,
          color: "#4a2d82",
        },
      ];
      return groups.map(({ title, labels, arr, color }) => (
        <div className="panel-section" key={title}>
          <div className="panel-section-title">{title}</div>
          {labels.map((l, i) => (
            <div className="coverage-row" key={i}>
              <div
                className={`coverage-icon ${arr[i] ? "yes" : "no"}`}
                style={arr[i] ? { background: color + "18", color } : {}}
              >
                {arr[i] ? "✓" : "—"}
              </div>
              <span className={`coverage-label ${arr[i] ? "" : "inactive"}`}>
                {l}
              </span>
            </div>
          ))}
        </div>
      ));
    }

    if (tab === "legal")
      return (
        <>
          <div className="panel-section">
            <div className="panel-section-title">Entidad</div>
            <div className="text">{fund.ent}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Normatividad</div>
            <div className="text">{fund.nor || "No disponible."}</div>
          </div>
          <div className="panel-section">
            <div className="panel-section-title">Web</div>
            <div className="text">
              {fund.web ? (
                <a
                  href={fund.web}
                  target="_blank"
                  rel="noreferrer"
                  className="panel-web-link"
                >
                  {fund.web}
                </a>
              ) : (
                "No disponible."
              )}
            </div>
          </div>
        </>
      );
  }

  return (
    <div
      className="panel-overlay open"
      onClick={(e) => {
        if (e.target.classList.contains("panel-backdrop")) closePanel();
      }}
    >
      <div className="panel-backdrop" />
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <div>
            <span
              className="tag-tipo"
              style={{ background: typeBg(fund.t), color: typeColor(fund.t) }}
            >
              {fund.t}
            </span>
            <h2>{fund.s}</h2>
            <p
              style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}
            >
              {fund.n}
            </p>
          </div>
          <button className="panel-close" onClick={closePanel}>
            ×
          </button>
        </div>
        <div style={{ padding: "0 28px" }}>
          <div className="panel-tabs">
            {TABS.map((t) => (
              <button
                key={t.k}
                className={`panel-tab${tab === t.k ? " active" : ""}`}
                onClick={() => setTab(t.k)}
              >
                {t.l}
              </button>
            ))}
          </div>
          <div style={{ paddingBottom: 32 }}>{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
