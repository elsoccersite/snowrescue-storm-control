import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    let dbOk = false;
    let dbError = null;
    try {
      if (env?.DB) {
        await env.DB.prepare("SELECT 1").first();
        dbOk = true;
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Database check failed";
    }

    return NextResponse.json({
      ok: Boolean(dbOk && process.env.SESSION_SECRET),
      dbBinding: Boolean(env?.DB),
      dbQuery: dbOk,
      dbError,
      sessionSecret: Boolean(process.env.SESSION_SECRET),
      admin1Configured: Boolean(process.env.STORM_ADMIN_EMAIL_1 && process.env.STORM_ADMIN_PASSWORD_1),
      admin2Configured: Boolean(process.env.STORM_ADMIN_EMAIL_2 && process.env.STORM_ADMIN_PASSWORD_2)
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Health check failed"
    }, { status: 500 });
  }
}
