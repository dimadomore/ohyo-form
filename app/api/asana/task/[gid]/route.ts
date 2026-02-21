import { NextRequest, NextResponse } from "next/server";
import { getTask, parseClientData } from "@/lib/asana";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gid: string }> },
) {
  try {
    const { gid } = await params;

    if (!gid) {
      return NextResponse.json(
        { error: "Missing gid parameter" },
        { status: 400 },
      );
    }

    const task = await getTask(gid);
    const client = parseClientData(task);

    // Return as array to match the existing frontend expectation
    return NextResponse.json([client]);
  } catch (err: any) {
    console.error("GET /api/asana/task/[gid] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
