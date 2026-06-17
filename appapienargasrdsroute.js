// app/api/enargas/rds/route.js
import { parseLatestRds } from "@/lib/parse-enargas";

export async function GET() {
  try {
    const data = await parseLatestRds();
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Error parseando RDS" },
      { status: 500 }
    );
  }
}