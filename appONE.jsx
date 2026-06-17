"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);

  async function loadData() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function copiar() {
    if (!data?.resumen) return;

    const aux = document.createElement("textarea");
    aux.value = data.resumen;
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);

    alert("Resumen copiado ✅");
  }

  if (!data) {
    return <div style={{ padding: 20 }}>Cargando...</div>;
  }

  return (
    <div style={{ padding: 20, background: "#0f172a", minHeight: "100vh", color: "white" }}>
      <h1>Gas Operativo</h1>

      {/* RESUMEN */}
      <div style={{ marginBottom: 20 }}>
        <strong>Resumen:</strong>
        <div>{data.resumen}</div>
      </div>

      <button onClick={copiar} style={{ marginBottom: 20 }}>
        Copiar resumen
      </button>

      {/* ALERTAS */}
      <div style={{ marginBottom: 20 }}>
        {data.alertas && data.alertas.map((a, i) => (
          <div key={i} style={{ marginBottom: 5 }}>
            {a.texto}
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div>
        <div>Linepack: {data.linepack}</div>
        <div>Delta: {data.delta}</div>
        <div>Demanda: {data.demandaPrioritaria}</div>
        <div>Total: {data.total}</div>
      </div>
    </div>
  );
}
``
  );
}
