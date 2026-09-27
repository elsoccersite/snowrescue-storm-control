"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO = "https://s3.amazonaws.com/webflow-prod-assets/6a961b945b645ae81792de3b/6a96f4d4dd5c508ffca9f8aa_logo-p-500.jpg";

function api(path) {
  if (typeof window === "undefined") return path;
  const root = window.location.pathname.replace(/\/$/, "");
  return `${root}${path}`;
}

async function readApiResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const short = text.replace(/\s+/g, " ").trim().slice(0, 180);
    throw new Error(`Storm Control backend returned ${res.status}: ${short || "non-JSON response"}`);
  }
}

function formatWhen(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(value));
  } catch { return value; }
}

export default function StormControlPage() {
  const [mode, setMode] = useState("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [state, setState] = useState(null);
  const [history, setHistory] = useState([]);
  const [savedState, setSavedState] = useState(null);

  async function load() {
    setError("");
    try {
      const res = await fetch(api("/api/admin/state"), { cache: "no-store", credentials: "same-origin" });
      if (res.status === 401) { setMode("login"); return; }
      const data = await readApiResponse(res);
      if (res.status === 503 && data.configurationRequired) { setMode("setup"); return; }
      if (!res.ok) throw new Error(data.error || "Unable to load Storm Control.");
      setUser(data.user);
      setConfig(data.config);
      setState(data.state);
      setSavedState(data.state);
      setMode("dashboard");
      const h = await fetch(api("/api/admin/history"), { cache: "no-store", credentials: "same-origin" });
      if (h.ok) setHistory((await readApiResponse(h)).history || []);
    } catch (e) {
      setError(e.message || "Unable to load Storm Control.");
      setMode("error");
    }
  }

  useEffect(() => { load(); }, []);

  async function login(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await fetch(api("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password })
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Unable to sign in.");
      setPassword("");
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch(api("/api/auth/logout"), { method: "POST", credentials: "same-origin" });
    setUser(null); setState(null); setMode("login");
  }

  const dirty = useMemo(() => JSON.stringify(state) !== JSON.stringify(savedState), [state, savedState]);

  function patch(part) { setState((s) => ({ ...s, ...part })); }
  function toggleArea(area) {
    const active = state.activeAreas.includes(area);
    patch({ activeAreas: active ? state.activeAreas.filter((a) => a !== area) : [...state.activeAreas, area] });
  }
  function addDelay(minutes) {
    patch({ delayMinutes: Math.min(60, Number(state.delayMinutes || 0) + minutes), timingPaused: false });
  }

  async function publish() {
    setBusy(true); setError("");
    try {
      const res = await fetch(api("/api/admin/state"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(state)
      });
      const data = await readApiResponse(res);
      if (!res.ok) throw new Error(data.error || "Unable to update Storm Desk.");
      setState(data.state); setSavedState(data.state);
      const h = await fetch(api("/api/admin/history"), { cache: "no-store", credentials: "same-origin" });
      if (h.ok) setHistory((await readApiResponse(h)).history || []);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  if (mode === "loading") return <ScreenMessage title="LOADING STORM CONTROL" text="Connecting to SnowRescue operations…" />;
  if (mode === "setup") return <ScreenMessage title="ONE-TIME SETUP REQUIRED" text="The app is deployed, but the private Andy/Natalie login secrets have not been configured in Webflow Cloud yet." />;
  if (mode === "error") return <ScreenMessage title="STORM CONTROL UNAVAILABLE" text={error || "Please try again."} action={<button className="button secondary" onClick={load}>TRY AGAIN</button>} />;

  if (mode === "login") {
    return (
      <main className="loginShell">
        <section className="loginCard">
          <img src={LOGO} alt="SnowRescue.ca crest" className="loginLogo" />
          <div className="eyebrow">PRIVATE OPERATIONS</div>
          <h1>STORM CONTROL</h1>
          <p>Authorized SnowRescue staff only.</p>
          <form onSubmit={login} className="loginForm">
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
            {error && <div className="error">{error}</div>}
            <button className="button primary" disabled={busy}>{busy ? "SIGNING IN…" : "SIGN IN"}</button>
          </form>
        </section>
      </main>
    );
  }

  const primary = config.statusMessages[state.status];
  const updateCandidate = state.messagePreset === config.defaultPresetByStatus[state.status] ? "none" : state.messagePreset;
  const updateValue = config.operationalUpdates.some((option) => option.value === updateCandidate) ? updateCandidate : "none";
  const updateText = updateValue === "custom"
    ? state.customMessage.trim()
    : (config.operationalUpdateMessages[updateValue] || "");

  function selectStatus(value) {
    patch({
      status: value,
      messagePreset: config.defaultPresetByStatus[value],
      customMessage: ""
    });
  }

  function selectOperationalUpdate(value) {
    if (value === "none") {
      patch({ messagePreset: config.defaultPresetByStatus[state.status], customMessage: "" });
      return;
    }
    patch({ messagePreset: value, customMessage: value === "custom" ? state.customMessage : "" });
  }
  return (
    <main>
      <header className="topbar">
        <div className="wrap topbarInner">
          <div className="brand"><img src={LOGO} alt="SnowRescue.ca crest" /><span>SNOWRESCUE</span></div>
          <div className="topActions"><span>{user?.name || user?.email}</span><button onClick={logout}>SIGN OUT</button></div>
        </div>
      </header>

      <section className="workspace">
        <div className="wrap">
          <div className="pageHead">
            <div><div className="eyebrow dark">STORM OPERATIONS</div><h1>STORM CONTROL</h1><p>Set the operating state once. Preview it. Publish it.</p></div>
            <a className="publicLink" href="/storm" target="_blank">VIEW PUBLIC STORM DESK</a>
          </div>

          {error && <div className="error banner">{error}</div>}

          <div className="layoutGrid">
            <section className="panel">
              <div className="panelHead"><div><div className="smallLabel">CURRENT OPERATING STATE</div><h2>Storm status</h2></div><span className="chip"><i />{config.statuses.find((s) => s.value === state.status)?.label}</span></div>
              <div className="statusGrid">
                {config.statuses.map((s) => <button key={s.value} type="button" className={`statusButton ${state.status === s.value ? "selected" : ""}`} onClick={() => selectStatus(s.value)}>{s.label}</button>)}
              </div>

              <Divider />
              <div className="fieldGrid">
                <Field label="SNOWFALL / CONDITIONS"><select value={state.snowfall} onChange={(e) => patch({ snowfall: e.target.value })}>{config.snowfallOptions.map((v) => <option key={v}>{v}</option>)}</select></Field>
                <Field label="ROUTE START"><input type="time" value={state.routeStart} onChange={(e) => patch({ routeStart: e.target.value })} /></Field>
                <Field label="CUSTOMER TIMING BUFFER"><select value={state.bufferMinutes} onChange={(e) => patch({ bufferMinutes: Number(e.target.value) })}>{config.bufferOptions.map((v) => <option key={v} value={v}>+{v} minutes</option>)}</select></Field>
                <Field label="ROUTE DELAY"><select value={state.delayMinutes} onChange={(e) => patch({ delayMinutes: Number(e.target.value), timingPaused: false })}>{config.delayOptions.map((v) => <option key={v} value={v}>{v ? `+${v} minutes` : "No added delay"}</option>)}</select></Field>
              </div>

              <Divider />
              <div className="smallLabel">ACTIVE SERVICE AREAS</div>
              <div className="areaGrid">{config.areaOptions.map((a) => <label key={a} className={`areaToggle ${state.activeAreas.includes(a) ? "on" : ""}`}><input type="checkbox" checked={state.activeAreas.includes(a)} onChange={() => toggleArea(a)} /><span>{a.toUpperCase()}</span></label>)}</div>

              <Divider />
              <div className="syncNotice"><strong>PRIMARY CUSTOMER MESSAGE</strong><span>{primary?.title}</span><p>Automatically synchronized to the selected Storm Status.</p></div>
              <Field label="OPERATIONAL UPDATE — OPTIONAL"><select value={updateValue} onChange={(e) => selectOperationalUpdate(e.target.value)}>{config.operationalUpdates.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
              {updateValue === "custom" && <Field label="CUSTOM OPERATIONAL UPDATE" className="messageField"><textarea rows="4" maxLength="500" value={state.customMessage} onChange={(e) => patch({ customMessage: e.target.value })} placeholder="Describe the unusual condition or timing issue. The Storm Status headline will remain authoritative." /></Field>}

              <div className="quickActions">
                <button type="button" onClick={() => addDelay(15)}>+15 MIN</button>
                <button type="button" onClick={() => addDelay(30)}>+30 MIN</button>
                <button type="button" onClick={() => patch({ delayMinutes: 60, timingPaused: false })}>+60 MIN</button>
                <button type="button" className={state.timingPaused ? "warning active" : "warning"} onClick={() => patch({ timingPaused: !state.timingPaused })}>{state.timingPaused ? "RESUME TIMING" : "PAUSE TIMING"}</button>
              </div>
            </section>

            <aside className="sideStack">
              <section className="sideCard">
                <div className="smallLabel">CUSTOMER VIEW PREVIEW</div>
                <div className="previewCard">
                  <div className="previewHead"><strong>{primary?.title || previewTitle(state, config)}</strong><span className="chip"><i />{primary?.chip || config.statuses.find((s) => s.value === state.status)?.label}</span></div>
                  <p>{primary?.message || "SnowRescue service update."}</p>
                  {updateText && <div className="previewUpdate"><strong>Operational update:</strong> {updateText}</div>}
                  <div className="previewMeta"><span>Conditions: {state.snowfall}</span><span>Areas: {state.activeAreas.join(", ") || "None selected"}</span><span>{state.timingPaused ? "Customer timing paused" : `Route delay: +${state.delayMinutes} min`}</span></div>
                </div>
              </section>

              <section className="sideCard">
                <div className="smallLabel">CHANGE HISTORY</div>
                <div className="historyList">{history.length ? history.slice(0, 8).map((h) => <div className="historyRow" key={h.id}><i /><div><strong>{h.summary}</strong><span>{h.changed_by} · {formatWhen(h.changed_at)}</span></div></div>) : <p className="muted">No published changes yet.</p>}</div>
              </section>

              <section className="systemCard"><div className="smallLabel light">SYSTEM STATUS</div><strong>LIVE CONTROL</strong><p>Changes are shared between authorized SnowRescue admins and become available to the public Storm Desk after you publish.</p></section>
            </aside>
          </div>

          <div className="publishBar">
            <div><div className="smallLabel light">PUBLICATION</div><strong>{dirty ? "Changes ready to publish" : `Last published ${formatWhen(savedState?.updatedAt)}`}</strong></div>
            <button className="button publish" disabled={busy || !dirty} onClick={publish}>{busy ? "UPDATING…" : "UPDATE STORM DESK"}</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function previewTitle(state, config) {
  const label = config.statuses.find((s) => s.value === state.status)?.label || "SERVICE UPDATE";
  if (state.status === "standby") return "NO ACTIVE SERVICE EVENT";
  if (state.status === "watch") return "WINTER EVENT WATCH";
  if (state.status === "activated") return "SERVICE ACTIVATED";
  if (state.status === "clearing") return "INITIAL CLEARING ACTIVE";
  if (state.status === "post_plow") return "POST-PLOW MONITORING";
  if (state.status === "complete") return "SERVICE EVENT COMPLETE";
  return label;
}

function Field({ label, children, className = "" }) { return <label className={`field ${className}`}><span>{label}</span>{children}</label>; }
function Divider() { return <div className="divider" />; }
function ScreenMessage({ title, text, action }) { return <main className="loginShell"><section className="loginCard"><img src={LOGO} alt="SnowRescue.ca crest" className="loginLogo" /><div className="eyebrow">SNOWRESCUE OPERATIONS</div><h1>{title}</h1><p>{text}</p>{action}</section></main>; }
