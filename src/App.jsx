import { useState } from "react";
import Nav from "./components/Nav";
import SearchPage from "./components/SearchPage";
import Dashboard from "./components/Dashboard";
import DetailPanel from "./components/DetailPanel";
import { funds } from "./data/funds";

export default function App() {
  const [page, setPage] = useState("busqueda");
  const [selectedFund, setSelectedFund] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  function openPanel(id, result = null) {
    setSelectedFund(funds.find((f) => f.id === id) || null);
    setSelectedResult(result);
  }

  function closePanel() {
    setSelectedFund(null);
    setSelectedResult(null);
  }

  return (
    <>
      <Nav page={page} setPage={setPage} goHome={() => setSelectedFund(null)} />

      {page === "busqueda" ? (
        <SearchPage openPanel={openPanel} />
      ) : (
        <Dashboard openPanel={openPanel} />
      )}

      {selectedFund && (
        <DetailPanel fund={selectedFund} result={selectedResult} closePanel={closePanel} />
      )}
    </>
  );
}
