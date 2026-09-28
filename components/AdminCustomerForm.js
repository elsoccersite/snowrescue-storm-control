"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const CITY_OPTIONS = ["Milton", "Oakville", "Burlington", "West Mississauga"];
const PACKAGE_OPTIONS = ["Essential", "Premium", "Signature"];
const CAPACITY_OPTIONS = ["1-2", "3-4", "5-6"];

function api(path) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}

function packageDefaults(name) {
  if (name === "Premium") return { postPlowIncluded: 4, baseline: 24 };
  if (name === "Signature") return { postPlowIncluded: 12, baseline: 26 };
  return { postPlowIncluded: 0, baseline: 20 };
}

export default function AdminCustomerForm() {
  const router = useRouter();
  const [packageName, setPackageName] = useState("Essential");
  const defaults = useMemo(() => packageDefaults(packageName), [packageName]);
  const [status, setStatus] = useState({ busy: false, message: "", error: false });

  async function submit(event) {
    event.preventDefault();
    setStatus({ busy: true, message: "Creating customer…", error: false });
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    body.scope = form.getAll("scope");
    body.postPlowUnlimited = form.get("postPlowUnlimited") === "on";
    body.sendInvite = form.get("sendInvite") === "on";
    body.postPlowIncluded = Number(body.postPlowIncluded || 0);
    body.baselineServiceMinutes = Number(body.baselineServiceMinutes || 20);

    try {
      const response = await fetch(api("/api/admin/customers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not create customer.");
      setStatus({ busy: false, message: data.invited ? "Customer created and invitation sent." : "Customer created.", error: false });
      event.currentTarget.reset();
      setPackageName("Essential");
      router.refresh();
    } catch (error) {
      setStatus({ busy: false, message: error.message || "Could not create customer.", error: true });
    }
  }

  return (
    <form className="adminForm" onSubmit={submit}>
      <div className="formGrid two">
        <label><span>First name</span><input name="firstName" required maxLength={80} /></label>
        <label><span>Last name</span><input name="lastName" required maxLength={80} /></label>
        <label><span>Email</span><input name="email" type="email" required maxLength={180} /></label>
        <label><span>Phone</span><input name="phone" inputMode="tel" maxLength={40} /></label>
      </div>

      <div className="formDivider" />
      <div className="formGrid two">
        <label className="span2"><span>Service address</span><input name="address1" required maxLength={180} /></label>
        <label><span>City / service area</span><select name="city" defaultValue="Milton">{CITY_OPTIONS.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label><span>Postal code</span><input name="postalCode" maxLength={12} /></label>
        <label><span>Neighbourhood</span><input name="neighbourhood" maxLength={100} placeholder="Optional" /></label>
        <label><span>Driveway capacity</span><select name="drivewayCapacity" defaultValue="1-2">{CAPACITY_OPTIONS.map((item) => <option key={item} value={item}>{item} cars</option>)}</select></label>
      </div>

      <div className="formDivider" />
      <div className="formGrid two">
        <label><span>Package</span><select name="packageName" value={packageName} onChange={(e) => setPackageName(e.target.value)}>{PACKAGE_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Baseline clearing minutes</span><input name="baselineServiceMinutes" type="number" min="5" max="240" key={`${packageName}-baseline`} defaultValue={defaults.baseline} /></label>
        <label><span>Included post-plow returns</span><input name="postPlowIncluded" type="number" min="0" max="99" key={`${packageName}-post`} defaultValue={defaults.postPlowIncluded} /></label>
        <label><span>Route zone</span><input name="routeZone" maxLength={80} placeholder="Leave blank for Phase 3" /></label>
      </div>

      <fieldset className="checks">
        <legend>Contracted scope</legend>
        <label><input type="checkbox" name="scope" value="Seasonal driveway clearing" defaultChecked /> Seasonal driveway clearing</label>
        <label><input type="checkbox" name="scope" value="Primary pedestrian route to the home" /> Primary pedestrian route to the home</label>
        <label><input type="checkbox" name="scope" value="Expanded agreed pedestrian access coverage" /> Expanded agreed pedestrian access coverage</label>
        <label><input type="checkbox" name="scope" value="Front entrance + stairs add-on" /> Front entrance + stairs add-on</label>
        <label><input type="checkbox" name="scope" value="Ice management" /> Ice management</label>
      </fieldset>

      <div className="formGrid one">
        <label><span>Internal access / property notes</span><textarea name="accessNotes" rows="3" maxLength={1000} placeholder="Gate, parked vehicles, narrow access, equipment notes…" /></label>
      </div>

      <div className="checks inlineChecks">
        <label><input type="checkbox" name="postPlowUnlimited" /> Unlimited Signature post-plow upgrade</label>
        <label><input type="checkbox" name="sendInvite" defaultChecked /> Send customer invitation now</label>
      </div>

      <div className="formActions">
        <button className="primaryButton" disabled={status.busy}>{status.busy ? "CREATING…" : "CREATE CUSTOMER"}</button>
        {status.message ? <span className={status.error ? "formStatus error" : "formStatus"}>{status.message}</span> : null}
      </div>
    </form>
  );
}
