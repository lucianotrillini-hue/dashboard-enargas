// app/api/enargas/prioritaria/route.js
import { parseDemandaPrioritaria } from "@/lib/parse-enargas";

export async function GET() {
  try {
    const data = await parseDemandaPrioritaria();
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Error parseando Demanda Prioritaria" },
      { status: 500 }
    );
  }
}