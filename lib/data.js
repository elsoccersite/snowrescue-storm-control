import { getDb } from "./runtime";
import { normalizeEmail } from "./auth";

function parseJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getPortalRecordByEmail(email) {
  const db = await getDb();
  const row = await db.prepare(`
    SELECT
      c.id AS contact_id, c.role, c.first_name, c.last_name, c.email, c.phone, c.invite_status,
      h.id AS household_id, h.season, h.status AS household_status,
      p.id AS property_id, p.address1, p.address2, p.city, p.province, p.postal_code,
      p.neighbourhood, p.driveway_capacity, p.baseline_service_minutes, p.route_zone,
      a.id AS agreement_id, a.package, a.status AS agreement_status,
      a.service_target_min_hours, a.service_target_max_hours,
      a.scope_json, a.addons_json, a.post_plow_included, a.post_plow_used, a.post_plow_unlimited
    FROM contacts c
    JOIN households h ON h.id = c.household_id
    JOIN properties p ON p.household_id = h.id
    LEFT JOIN service_agreements a ON a.property_id = p.id AND a.season = h.season
    WHERE lower(c.email) = ?
    LIMIT 1
  `).bind(normalizeEmail(email)).first();

  if (!row) return null;
  return {
    ...row,
    scope: parseJson(row.scope_json),
    addons: parseJson(row.addons_json),
    post_plow_unlimited: Boolean(row.post_plow_unlimited)
  };
}

export async function getServiceHistory(propertyId, limit = 12) {
  const db = await getDb();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 12, 50));
  const { results } = await db.prepare(`
    SELECT id, event_type, status, event_started_at, completed_at, notes, created_at
    FROM service_events
    WHERE property_id = ? AND visible_to_customer = 1
    ORDER BY COALESCE(completed_at, event_started_at, created_at) DESC
    LIMIT ?
  `).bind(propertyId, safeLimit).all();
  return results || [];
}

export async function markContactAccepted(contactId) {
  if (!contactId) return;
  const db = await getDb();
  await db.prepare("UPDATE contacts SET invite_status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND invite_status <> 'accepted'").bind(contactId).run();
}

export async function listCustomers(limit = 200) {
  const db = await getDb();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 200, 500));
  const { results } = await db.prepare(`
    SELECT
      h.id AS household_id, h.season, h.status AS household_status,
      c.id AS contact_id, c.first_name, c.last_name, c.email, c.phone, c.invite_status,
      p.id AS property_id, p.address1, p.city, p.postal_code, p.neighbourhood, p.driveway_capacity, p.route_zone,
      a.package, a.status AS agreement_status, a.post_plow_included, a.post_plow_used, a.post_plow_unlimited
    FROM households h
    JOIN contacts c ON c.household_id = h.id AND c.role = 'primary'
    JOIN properties p ON p.household_id = h.id
    LEFT JOIN service_agreements a ON a.property_id = p.id AND a.season = h.season
    ORDER BY c.last_name COLLATE NOCASE, c.first_name COLLATE NOCASE
    LIMIT ?
  `).bind(safeLimit).all();
  return results || [];
}

export async function getStormStatus() {
  const url = process.env.STORM_STATUS_URL || "https://snowrescue.ca/storm-control/api/public/status";
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.status || null;
  } catch {
    return null;
  }
}
