# SnowRescue Storm Control V1

Private mobile-first storm operations control for SnowRescue.ca.

## What it includes

- Andy/Natalie secure sign-in
- Storm status: Standby, Watch, Activated, Initial Clearing, Post-Plow, Complete
- Snowfall/conditions selector
- Route start time
- Customer ETA protection buffer
- Route delay controls and Pause Timing
- Active service-area toggles
- Approved message presets + custom message
- Persistent shared storm state in Webflow Cloud SQLite
- Audit/change history
- Public read-only storm-status API for `snowrescue.ca/storm`

## Webflow Cloud mount

Deploy as a site-attached Webflow Cloud app at:

`/storm-control`

The public status endpoint will be:

`/storm-control/api/public/status`

## Required Webflow Cloud environment variables

Add these in the app environment before enabling production use:

- `SESSION_SECRET` — long random secret, ideally 32+ characters
- `STORM_ADMIN_EMAIL_1`
- `STORM_ADMIN_PASSWORD_1`
- `STORM_ADMIN_NAME_1`
- `STORM_ADMIN_EMAIL_2`
- `STORM_ADMIN_PASSWORD_2`
- `STORM_ADMIN_NAME_2`

Do not commit real passwords or the session secret to GitHub.

## Storage

`wrangler.json` declares a D1/SQLite binding called `DB`. Webflow Cloud provisions the production database and automatically applies the SQL migration in `/migrations` on deploy.

## Public Storm Desk integration

After the app deploys, the existing Webflow `/storm` page should fetch:

`/storm-control/api/public/status`

and map the returned `title`, `chip`, `stage`, `message`, `snowfall`, `activeAreas`, and `updatedAt` fields into the public status card.
