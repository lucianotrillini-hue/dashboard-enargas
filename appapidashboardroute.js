export async function GET() {
  return Response.json({
    linepack: 345,
    delta: -2,
    demandaPrioritaria: 58,
    total: 140,
    resumen: "Sistema en condición ajustada",
    alertas: [
      { tipo: "alerta", texto: "Linepack bajo" }
    ]
  });
}
