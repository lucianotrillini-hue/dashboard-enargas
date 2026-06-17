"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyOk, setCopyOk] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Error cargando dashboard");
      }

      setData(json);
    } catch (err) {
      setError(err.message || "No se pudo cargar el dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function copiarResumen() {
    if (!data?.resumen) return;

    try {
      // intenta clipboard moderno
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data.resumen);
      } else {
        // fallback para navegadores/entornos más restrictivos
        const aux = document.createElement("textarea");
        aux.value = data.resumen;
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
      }

      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1800);
    } catch {
      alert("No se pudo copiar automáticamente. Copia manualmente el resumen.");
    }
  }

  const alertColor = {
    critico: {
      bg: "#7f1d1d",
      border: "#b91c1c",
    },
    alerta: {
      bg: "#78350f",
      border: "#d97706",
    },
    tendencia: {
      bg: "#1e3a8a",
      border: "#2563eb",
    },
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
  };

  const containerStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  };

  const logoWrapStyle = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  };

  const logoBoxStyle = {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    color: "white",
    fontSize: "18px",
  };

  const kpiGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "12px",
    marginBottom: "24px",
  };

  const kpiCardStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "16px",
  };

  const buttonPrimary = {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const buttonSecondary = {
    background: "#1e293b",
    color: "#f1f5f9",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const panelStyle = {
    background: "#111827",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "20px",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={{ margin: 0, fontSize: "28px" }}>Gas Operativo</h1>
          <p style={{ color: "#94a3b8" }}>Cargando dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h1 style={{ margin: 0, fontSize: "28px" }}>Gas Operativo</h1>

          <div
            style={{
              marginTop: "18px",
              background: "#7f1d1d",
              border: "1px solid #b91c1c",
              color: "#fff",
              padding: "16px",
              borderRadius: "12px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>

          <div style={{ marginTop: "14px" }}>
            <button style={buttonPrimary} onClick={loadDashboard}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <div style={logoWrapStyle}>
            <div style={logoBoxStyle}>G</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "28px" }}>Gas · Tablero Operativo</h1>
              <div style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
                Monitoreo diario del sistema
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button style={buttonSecondary} onClick={loadDashboard}>
              Actualizar
            </button>
            <button style={buttonPrimary} onClick={copiarResumen}>
              {copyOk ? "✅ Resumen copiado" : "📋 Copiar resumen operativo"}
            </button>
          </div>
        </div>

        {/* RESUMEN */}
        <div style={panelStyle}>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
            Resumen operativo
          </div>
          <div style={{ fontSize: "16px", lineHeight: 1.6 }}>
            {data?.resumen || "Sin resumen disponible"}
          </div>
        </div>

        {/* ALERTAS */}
        {Array.isArray(data?.alertas) && data.alertas.length > 0 && (
          <div style={{ marginBottom: "22px" }}>
            {data.alertas.map((a, i) => (
              <div
                key={`${a.tipo}-${i}`}
                style={{
                  background: alertColor[a.tipo]?.bg || "#334155",
                  border: `1px solid ${alertColor[a.tipo]?.border || "#475569"}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {a.texto}
              </div>
            ))}
          </div>
        )}

        {/* KPIS */}
        <div style={kpiGridStyle}>
          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              Linepack
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.linepack ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              Delta
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.delta ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              Demanda prioritaria
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.demandaPrioritaria ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              Total sistema
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.total ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              CAMMESA
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.cammesa ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              Industria
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.industria ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              GNC
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.gnc ?? "-"}
            </div>
          </div>

          <div style={kpiCardStyle}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
              TMedia
            </div>
            <div style={{ fontSize: "30px", fontWeight: "bold" }}>
              {data?.tmed ?? "-"}
            </div>
          </div>
        </div>

        {/* FUENTES */}
        <div style={panelStyle}>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "10px" }}>
            Fuentes cargadas por backend
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            {data?.sourceRdsUrl ? (
              <a
                href={data.sourceRdsUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#93c5fd", textDecoration: "none" }}
              >
                Ver fuente RDS
              </a>
            ) : null}

            {data?.sourcePrioritariaUrl ? (
              <a
                href={data.sourcePrioritariaUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#93c5fd", textDecoration: "none" }}
              >
                Ver fuente Demanda Prioritaria
              </a>
            ) : null}

            {data?.fechaRds ? (
              <div style={{ color: "#cbd5e1", fontSize: "14px" }}>
                Fecha RDS: {data.fechaRds}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}