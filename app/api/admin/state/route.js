import { NextResponse } from "next/server";
import { authConfigured, getSessionUser } from "../../../../lib/auth";
import { adminConfig, getStormState, updateStormState } from "../../../../lib/state";

export const runtime = "edge";

export async function GET(request) {
  try {
    if (!authConfigured()) {
      return NextResponse.json({ configurationRequired: true }, { status: 503 });
    }
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const state = await getStormState();
    return NextResponse.json({ state, config: adminConfig(), user: { email: user.email, name: user.name } });
  } catch (error) {
    console.error("admin state GET error", error);
    return NextResponse.json({ error: "Unable to load Storm Control." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const input = await request.json();
    const state = await updateStormState(input, user);
    return NextResponse.json({ ok: true, state });
  } catch (error) {
    console.error("admin state PUT error", error);
    return NextResponse.json({ error: "Unable to update Storm Desk." }, { status: 500 });
  }
}
