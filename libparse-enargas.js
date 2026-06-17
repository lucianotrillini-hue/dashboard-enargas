// lib/parse-enargas.js
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";
import { fetchText, fetchBuffer } from "./http";

const URL_RDS_INDEX =
  "https://www.enargas.gob.ar/secciones/transporte-y-distribucion/dod-reporte-diario-sistema.php";

const URL_PROYECCION_SEMANAL =
  "https://www.enargas.gob.ar/secciones/transporte-y-distribucion/dod-proyeccion-semanal.php";

const URL_PRIORITARIA =
  "https://www.enargas.gob.ar/secciones/transporte-y-distribucion/dod-estimacion-demanda-prioritaria.php";

// ---------- helpers ----------
function cleanText(s = "") {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\r/g, "")
    .trim();
}

function toNumber(raw) {
  if (raw == null) return null;
  const s = String(raw)
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// Busca "etiqueta ... número"
function extractAfterLabel(text, labelRegex) {
  const m = text.match(labelRegex);
  if (!m) return null;
  return toNumber(m[1]);
}

// ---------- RDS ----------
export async function getLatestRdsPdfUrl() {
  const html = await fetchText(URL_RDS_INDEX);
  const $ = cheerio.load(html);

  // 1) intenta encontrar el primer href pdf
  let href =
    $('a[href*="reporte-diario-sistema/"][href$=".pdf"]').first().attr("href") ||
    $('a[href$=".pdf"]').first().attr("href") ||
    null;

  if (!href) {
    // fallback regex sobre HTML
    const match = html.match(/href=["']([^"']*reporte-diario-sistema\/[^"']+\.pdfi);
    href = match?.[1] || null;
  }

  if (!href) {
    throw new Error("No pude encontrar el PDF del RDS en la página índice.");
  }

  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `https://www.enargas.gob.ar${href}`;
  return `https://www.enargas.gob.ar/secciones/transporte-y-distribucion/${href}`;
}

export async function parseLatestRds() {
  const pdfUrl = await getLatestRdsPdfUrl();
  const pdfBuffer = await fetchBuffer(pdfUrl);
  const parsed = await pdfParse(pdfBuffer);
  const text = cleanText(parsed.text);

  // Extrae fecha
  const fecha =
    text.match(/D[ií]a Operativo:\s*([^\n]+)/i)?.[1]?.trim() ||
    text.match(/Reporte de Estimaci[oó]n Diaria del Sistema\s*([^\n]+)/i)?.[1]?.trim() ||
    null;

  // Campos principales observados en RDS_20260514.pdf
  const linepack = extractAfterLabel(text, /Line\s*Pack:\s*([\d.,-]+)/i);
  const delta = extractAfterLabel(text, /Delta:\s*([\d.,-]+)/i);
  const demandaPrioritaria = extractAfterLabel(
    text,
    /Demanda\s+Prioritaria\s*([\d.,-]+)/i
  );
  const cammesa = extractAfterLabel(text, /CAMMESA.*?\)?\s*([\d.,-]+)/i);
  const industria = extractAfterLabel(text, /Industria\s*\(P3\+GU\)\s*([\d.,-]+)/i);
  const gnc = extractAfterLabel(text, /GNC\s*([\d.,-]+)/i);
  const combustible = extractAfterLabel(text, /Combustible\s*([\d.,-]+)/i);

  // TOTAL puede estar en varias formas
  let total =
    extractAfterLabel(text, /TOTAL\s*-\s*Consumo Total Estimado dentro del Sistema de Transporte\s*([\d.,-]+)/i) ??
    extractAfterLabel(text, /TOTAL\s*([\d.,-]+)/i);

  // TM del día operativo
  let tmed =
    extractAfterLabel(text, /Pron[oó]stico del SMN.*?TM\s*\(°C\).*?([\d.,-]+)/is) ??
    extractAfterLabel(text, /\bTM\s*\(°C\)\b.*?([\d.,-]+)/is) ??
    extractAfterLabel(text, /TMedia\s*°C.*?([\d.,-]+)/is);

  return {
    source: "RDS",
    url: pdfUrl,
    fecha,
    linepack,
    delta,
    demandaPrioritaria,
    cammesa,
    industria,
    gnc,
    combustible,
    total,
    tmed,
    rawText: text,
  };
}

// ---------- Demanda Prioritaria ----------
export async function parseDemandaPrioritaria() {
  const html = await fetchText(URL_PRIORITARIA);
  const text = cleanText(cheerio.load(html).text());

  // La página muestra algo como:
  // Licenciataria TMED GBA 11/06/26 14.1 ° ... 15/06/26 9 °
  // Licenciataria TOTALES: 11/06/26 64.5222 ... 15/06/26 73.4209

  const dates = [...text.matchAll(/\b(\d{2}\/\d{2}\/\d{2})\b/g)].map(m => m[1]);
  const uniqueDates = [...new Set(dates)];

  const tmedSection =
    text.match(/TMED GBA(.*?)(TOTALES:)/i)?.[1] || "";

  const totalsSection =
    text.match(/TOTALES:(.*?)(MetroGAS|Naturgy BAN|Camuzzi|Datos hist[oó]ricos)/i)?.[1] || "";

  const tmedByDate = {};
  uniqueDates.forEach((d) => {
    const re = new RegExp(`${d}\\s*([\\d.,-]+)\\s*°`, "i");
    const m = tmedSection.match(re);
    if (m) tmedByDate[d] = toNumber(m[1]);
  });

  const totalsByDate = {};
  uniqueDates.forEach((d) => {
    const re = new RegExp(`${d}\\s*([\\d.,-]+)`, "i");
    const m = totalsSection.match(re);
    if (m) totalsByDate[d] = toNumber(m[1]);
  });

  // Última fecha visible
  const latestDate = uniqueDates.at(-1) || null;

  return {
    source: "DemandaPrioritaria",
    url: URL_PRIORITARIA,
    latestDate,
    tmedGBA: latestDate ? tmedByDate[latestDate] ?? null : null,
    totalPrioritaria: latestDate ? totalsByDate[latestDate] ?? null : null,
    dates: uniqueDates,
    tmedByDate,
    totalsByDate,
    rawText: text,
  };
}

// ---------- Proyección Semanal ----------
export async function parseProyeccionSemanal() {
  const html = await fetchText(URL_PROYECCION_SEMANAL);
  const text = cleanText(cheerio.load(html).text());

  // La página listada en buscador muestra el índice con fechas disponibles,
  // no una tabla JSON. Por eso retorno como mínimo las fechas detectadas y el texto crudo.
  const dates = [...text.matchAll(/\b(\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{2})\b/g)].map(m => m[1]);
  const uniqueDates = [...new Set(dates)];

  return {
    source: "ProyeccionSemanal",
    url: URL_PROYECCION_SEMANAL,
    availableDates: uniqueDates,
    rawText: text,
  };
}

// ---------- Dashboard consolidado ----------
export function buildAlerts({ linepack, delta, demandaPrioritaria, total }) {
  const alerts = [];

  if (linepack != null) {
    if (linepack < 330) alerts.push({ tipo: "critico", texto: "Linepack crítico" });
    else if (linepack < 340) alerts.push({ tipo: "alerta", texto: "Linepack bajo" });
  }

  if (delta != null && delta < 0) {
    alerts.push({ tipo: "tendencia", texto: "Linepack en descenso" });
  }

  if (total != null && total > 145) {
    alerts.push({ tipo: "critico", texto: "Demanda alta" });
  } else if (demandaPrioritaria != null && demandaPrioritaria > 60) {
    alerts.push({ tipo: "alerta", texto: "Demanda prioritaria elevada" });
  }

  return alerts;
}

export function buildSummary({ total, demandaPrioritaria, linepack }) {
  const out = [];
  if (total != null) out.push(`Total ${total} MMm³/d`);
  if (demandaPrioritaria != null) out.push(`Prioritaria ${demandaPrioritaria}`);
  if (linepack != null) out.push(`Linepack ${linepack}`);

  let resumen = out.join(" · ");
  if (linepack != null) {
    if (linepack < 330) resumen += " · sistema crítico";
    else if (linepack < 340) resumen += " · sistema ajustado";
  }
  return resumen;
}