import { NextResponse } from "next/server";
import { getStormState, toPublicState } from "../../../../../lib/state";

export const runtime = "edge";

export async function GET() {
  try {
    const state = await getStormState();
    const response = NextResponse.json({ status: toPublicState(state) });
    response.headers.set("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
    return response;
  } catch (error) {
    console.error("public status error", error);
    return NextResponse.json({ error: "Storm status is temporarily unavailable." }, { status: 503 });
  }
}
