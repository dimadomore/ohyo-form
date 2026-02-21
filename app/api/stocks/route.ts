import { NextResponse } from "next/server";
import { fetchSmartbillStocks } from "@/lib/smartbill";

export async function GET() {
  try {
    const data = await fetchSmartbillStocks();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/stocks error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
