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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(data.resumen);
      } else {
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


    </div>
  );
}
