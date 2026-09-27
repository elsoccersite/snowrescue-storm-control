import { getCloudflareContext } from "@opennextjs/cloudflare";

// Webflow Cloud custom environment variables are exposed through process.env.
// Cloudflare resource bindings (D1/KV/R2) are exposed through the Workers context.
export function getEnv() {
  return process.env;
}

export async function getDb() {
  const { env } = await getCloudflareContext();
  if (!env?.DB) throw new Error("SnowRescue DB binding is not available.");
  return env.DB;
}
