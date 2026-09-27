import { NextResponse } from "next/server";
import { authenticateCredentials, createSessionToken, setSessionCookie } from "../../../../lib/auth";
import { getDb } from "../../../../lib/runtime";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
    const db = await getDb();

    const recent = await db.prepare(`SELECT COUNT(*) AS count FROM auth_attempts
      WHERE attempted_at >= datetime('now','-10 minutes') AND (email = ? OR ip = ?)`)
      .bind(email, ip).first();
    if (Number(recent?.count || 0) >= 10) {
      return NextResponse.json({ error: "Too many sign-in attempts. Try again shortly." }, { status: 429 });
    }

    const result = await authenticateCredentials(email, password);
    if (result.configurationRequired) {
      return NextResponse.json({ error: "Storm Control login is not configured yet.", configurationRequired: true }, { status: 503 });
    }

    await db.prepare("INSERT INTO auth_attempts (email, ip, success) VALUES (?, ?, ?)")
      .bind(email || "unknown", ip, result.ok ? 1 : 0).run();

    if (!result.ok) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const token = await createSessionToken(result);
    const response = NextResponse.json({ ok: true, user: { email: result.email, name: result.name } });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
