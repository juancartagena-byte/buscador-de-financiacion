import { PROCS } from "../data/constants";
import { scoreColor, scoreBg, typeColor, typeBg } from "../utils/helpers";
import { exportFundPdf } from "../utils/exportPdf";

export default function ResultCard({ result, fund, index, onClick }) {
  return (
    <div
      className="result-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => onClick(fund.id)}
    >
      <div className="score-badge">
        <div
          className="ring"
          style={{
            background: scoreBg(result.score),
            color: scoreColor(result.score),
          }}
        >
          {result.score}
        </div>
        <span className="label">MATCH</span>
      </div>
      <div className="result-body">
        <h3 className="result-short">{fund.n}</h3>
        <p className="result-full" style={{ color: typeColor(fund.t) }}>
          {fund.t}
        </p>
        <div className="result-reason">{result.reason}</div>
        <div className="result-procs">
          {fund.p.map((v, j) =>
            v ? <span key={j}>{PROCS[j].split("–")[0].trim()}</span> : null,
          )}
        </div>
      </div>
      <button
        className="card-pdf-btn"
        title="Descargar PDF"
        onClick={(e) => { e.stopPropagation(); exportFundPdf(result, fund); }}
      >
        ↓ PDF
      </button>
      <div className="result-arrow">→</div>
    </div>
  );
}
