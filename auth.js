import { getEnv } from "./runtime";

const COOKIE_NAME = "sr_storm_session";
const SESSION_HOURS = 12;

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(input) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function utf8(input) {
  return new TextEncoder().encode(input);
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, utf8(value)));
}

async function sha256(input) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", utf8(input)));
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function adminsFromEnv(env) {
  const admins = [1, 2]
    .map((i) => ({
      email: env[`STORM_ADMIN_EMAIL_${i}`]?.trim().toLowerCase(),
      password: env[`STORM_ADMIN_PASSWORD_${i}`],
      name: env[`STORM_ADMIN_NAME_${i}`]?.trim() || `Admin ${i}`
    }))
    .filter((a) => a.email && a.password);
  return admins;
}

export function authConfigured() {
  const env = getEnv();
  return Boolean(env.SESSION_SECRET && adminsFromEnv(env).length);
}

export async function authenticateCredentials(email, password) {
  const env = getEnv();
  if (!env.SESSION_SECRET) return { ok: false, configurationRequired: true };
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const candidate = adminsFromEnv(env).find((a) => a.email === normalizedEmail);
  if (!candidate) {
    await sha256(String(password || ""));
    return { ok: false };
  }
  const [given, expected] = await Promise.all([sha256(String(password || "")), sha256(candidate.password)]);
  return constantTimeEqual(given, expected)
    ? { ok: true, email: candidate.email, name: candidate.name }
    : { ok: false };
}

export async function createSessionToken(user) {
  const env = getEnv();
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured.");
  const payload = {
    email: user.email,
    name: user.name,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000
  };
  const body = bytesToBase64Url(utf8(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(env.SESSION_SECRET, body));
  return `${body}.${signature}`;
}

export async function verifySessionToken(token) {
  try {
    const env = getEnv();
    if (!env.SESSION_SECRET || !token) return null;
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = await hmac(env.SESSION_SECRET, body);
    const given = base64UrlToBytes(sig);
    if (!constantTimeEqual(given, expected)) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body)));
    if (!payload?.email || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUser(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function setSessionCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
