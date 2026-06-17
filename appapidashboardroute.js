// app/api/dashboard/route.js
import {
  parseLatestRds,
  parseDemandaPrioritaria,
  buildAlerts,
  buildSummary
} from "@/lib/parse-enargas";

export async function GET() {
  try {
    const [rds, prioritaria] = await Promise.all([
      parseLatestRds(),
      parseDemandaPrioritaria(),
    ]);

    const linepack = rds.linepack;
    const delta = rds.delta;
    const demandaPrioritaria = rds.demandaPrioritaria ?? prioritaria.totalPrioritaria ?? null;
    const total = rds.total;
    const cammesa = rds.cammesa;
    const industria = rds.industria;
    const gnc = rds.gnc;
    const combustible = rds.combustible;
    const tmed = rds.tmed ?? prioritaria.tmedGBA ?? null;

    const alertas = buildAlerts({
      linepack,
      delta,
      demandaPrioritaria,
      total,
    });

    const resumen = buildSummary({
      total,
      demandaPrioritaria,
      linepack,
    });

    return Response.json({
      fechaRds: rds.fecha,
      sourceRdsUrl: rds.url,
      sourcePrioritariaUrl: prioritaria.url,
      linepack,
      delta,
      demandaPrioritaria,
      total,
      cammesa,
      industria,
      gnc,
      combustible,
      tmed,
      alertas,
      resumen,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Error armando dashboard" },
      { status: 500 }
    );
  }
}