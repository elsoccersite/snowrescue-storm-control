import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { getHistory } from "../../../../lib/state";

export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const history = await getHistory(30);
    return NextResponse.json({ history });
  } catch (error) {
    console.error("history error", error);
    return NextResponse.json({ error: "Unable to load history." }, { status: 500 });
  }
}
