import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getEnv() {
  return process.env;
}

export async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env?.DB) throw new Error("SnowRescue Client Portal DB binding is not available.");
  return env.DB;
}
