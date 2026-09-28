import { currentUser } from "@clerk/nextjs/server";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function adminEmails() {
  return String(process.env.PORTAL_ADMIN_EMAILS || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

export function userEmails(user) {
  return (user?.emailAddresses || []).map((item) => normalizeEmail(item.emailAddress)).filter(Boolean);
}

export function primaryEmail(user) {
  const preferred = (user?.emailAddresses || []).find((item) => item.id === user?.primaryEmailAddressId);
  return normalizeEmail(preferred?.emailAddress || user?.emailAddresses?.[0]?.emailAddress);
}

export function isAdminUser(user) {
  const allowed = new Set(adminEmails());
  return userEmails(user).some((email) => allowed.has(email));
}

export async function requireAdminUser() {
  const user = await currentUser();
  if (!user || !isAdminUser(user)) return null;
  return user;
}
