// app/api/enargas/proyeccion-semanal/route.js
import { parseProyeccionSemanal } from "@/lib/parse-enargas";

export async function GET() {
  try {
    const data = await parseProyeccionSemanal();
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Error parseando Proyección Semanal" },
      { status: 500 }
    );
  }
}