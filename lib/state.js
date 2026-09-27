import { getDb } from "./runtime";
import {
  AREA_OPTIONS,
  BUFFER_OPTIONS,
  DELAY_OPTIONS,
  MESSAGE_PRESETS,
  SECONDARY_UPDATE_OPTIONS,
  SNOWFALL_OPTIONS,
  STATUS_DEFAULT_PRESET,
  STATUS_OPTIONS,
  getPrimaryPresentation,
  publicPresentation
} from "./presets";

function rowToState(row) {
  return {
    status: row.status,
    snowfall: row.snowfall,
    routeStart: row.route_start,
    bufferMinutes: Number(row.buffer_minutes),
    delayMinutes: Number(row.delay_minutes),
    timingPaused: Boolean(row.timing_paused),
    messagePreset: row.message_preset,
    customMessage: row.custom_message || "",
    activeAreas: JSON.parse(row.active_areas || "[]"),
    updatedBy: row.updated_by,
    updatedAt: row.updated_at
  };
}

export async function getStormState() {
  const db = await getDb();
  const row = await db.prepare("SELECT * FROM storm_state WHERE id = 1").first();
  if (!row) {
    await db.prepare(`INSERT INTO storm_state (
      id, status, snowfall, route_start, buffer_minutes, delay_minutes,
      timing_paused, message_preset, custom_message, active_areas,
      updated_by, updated_at
    ) VALUES (1, 'standby', '5 cm', '04:00', 30, 0, 0, 'standard-standby', '', ?, 'system', CURRENT_TIMESTAMP)`)
      .bind(JSON.stringify(AREA_OPTIONS)).run();
    return getStormState();
  }
  return rowToState(row);
}

function validate(input, current) {
  const allowedStatuses = new Set(STATUS_OPTIONS.map((s) => s.value));
  const status = allowedStatuses.has(input.status) ? input.status : current.status;
  const snowfall = SNOWFALL_OPTIONS.includes(input.snowfall) ? input.snowfall : current.snowfall;
  const routeStart = /^([01]\d|2[0-3]):[0-5]\d$/.test(input.routeStart || "") ? input.routeStart : current.routeStart;
  const bufferMinutes = BUFFER_OPTIONS.includes(Number(input.bufferMinutes)) ? Number(input.bufferMinutes) : current.bufferMinutes;
  const delayMinutes = DELAY_OPTIONS.includes(Number(input.delayMinutes)) ? Number(input.delayMinutes) : current.delayMinutes;
  const timingPaused = Boolean(input.timingPaused);

  const defaultPreset = STATUS_DEFAULT_PRESET[status] || "standard-standby";
  const requestedPreset = String(input.messagePreset || "");
  const requestedKind = MESSAGE_PRESETS[requestedPreset]?.kind;
  const messagePreset = requestedKind === "secondary" || requestedKind === "custom"
    ? requestedPreset
    : defaultPreset;

  const customMessage = messagePreset === "custom"
    ? String(input.customMessage || "").trim().slice(0, 500)
    : "";

  const areas = Array.isArray(input.activeAreas)
    ? input.activeAreas.filter((a) => AREA_OPTIONS.includes(a))
    : current.activeAreas;
  const activeAreas = [...new Set(areas)];
  return { status, snowfall, routeStart, bufferMinutes, delayMinutes, timingPaused, messagePreset, customMessage, activeAreas };
}

function summarize(before, after) {
  const changes = [];
  const names = {
    status: "status",
    snowfall: "conditions",
    routeStart: "route start",
    bufferMinutes: "customer buffer",
    delayMinutes: "route delay",
    timingPaused: "timing pause",
    messagePreset: "operational update",
    customMessage: "custom operational update",
    activeAreas: "service areas"
  };
  for (const key of Object.keys(names)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changes.push(names[key]);
  }
  return changes.length ? `Updated ${changes.join(", ")}` : "Re-published current storm state";
}

export async function updateStormState(input, user) {
  const db = await getDb();
  const before = await getStormState();
  const clean = validate(input, before);
  const updatedAt = new Date().toISOString();
  const after = { ...clean, updatedBy: user.name || user.email, updatedAt };

  await db.batch([
    db.prepare(`UPDATE storm_state SET
      status = ?, snowfall = ?, route_start = ?, buffer_minutes = ?, delay_minutes = ?,
      timing_paused = ?, message_preset = ?, custom_message = ?, active_areas = ?,
      updated_by = ?, updated_at = ? WHERE id = 1`)
      .bind(
        after.status, after.snowfall, after.routeStart, after.bufferMinutes, after.delayMinutes,
        after.timingPaused ? 1 : 0, after.messagePreset, after.customMessage,
        JSON.stringify(after.activeAreas), after.updatedBy, after.updatedAt
      ),
    db.prepare(`INSERT INTO storm_change_log (changed_by, changed_at, summary, before_json, after_json)
      VALUES (?, ?, ?, ?, ?)`)
      .bind(after.updatedBy, updatedAt, summarize(before, after), JSON.stringify(before), JSON.stringify(after))
  ]);

  return after;
}

export async function getHistory(limit = 30) {
  const db = await getDb();
  const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 100));
  const { results } = await db.prepare(
    "SELECT id, changed_by, changed_at, summary FROM storm_change_log ORDER BY id DESC LIMIT ?"
  ).bind(safeLimit).all();
  return results || [];
}

export function toPublicState(state) {
  const presentation = publicPresentation(state);
  return {
    status: state.status,
    snowfall: state.snowfall,
    routeStart: state.routeStart,
    bufferMinutes: state.bufferMinutes,
    delayMinutes: state.delayMinutes,
    timingPaused: state.timingPaused,
    activeAreas: state.activeAreas,
    updatedAt: state.updatedAt,
    ...presentation
  };
}

export function adminConfig() {
  const operationalUpdates = [
    { value: "none", label: "No additional update" },
    ...SECONDARY_UPDATE_OPTIONS.map((value) => ({ value, label: MESSAGE_PRESETS[value].label }))
  ];

  const statusMessages = Object.fromEntries(
    STATUS_OPTIONS.map(({ value }) => {
      const primary = getPrimaryPresentation(value);
      return [value, {
        preset: STATUS_DEFAULT_PRESET[value],
        title: primary.title,
        chip: primary.chip,
        stage: primary.stage,
        message: primary.message
      }];
    })
  );

  const operationalUpdateMessages = Object.fromEntries(
    SECONDARY_UPDATE_OPTIONS.map((value) => [value, MESSAGE_PRESETS[value]?.update || ""])
  );

  return {
    statuses: STATUS_OPTIONS,
    snowfallOptions: SNOWFALL_OPTIONS,
    areaOptions: AREA_OPTIONS,
    bufferOptions: BUFFER_OPTIONS,
    delayOptions: DELAY_OPTIONS,
    defaultPresetByStatus: STATUS_DEFAULT_PRESET,
    statusMessages,
    operationalUpdates,
    operationalUpdateMessages
  };
}
