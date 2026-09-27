import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getEnv() {
  const { env } = getCloudflareContext();
  return env;
}

export function getDb() {
  const env = getEnv();
  if (!env.DB) throw new Error("SnowRescue DB binding is not available.");
  return env.DB;
}
