# SnowRescue Storm Control V1.2

Private operations control for SnowRescue Storm Desk.

## Webflow Cloud
- Framework: Next.js 16
- Mount: `/storm-control`
- Storage: Webflow Cloud SQLite binding `DB`
- Public endpoint: `/storm-control/api/public/status`

## Required secret environment variables after the first successful deployment
- `SESSION_SECRET`
- `STORM_ADMIN_EMAIL_1`
- `STORM_ADMIN_PASSWORD_1`
- `STORM_ADMIN_NAME_1`
- `STORM_ADMIN_EMAIL_2`
- `STORM_ADMIN_PASSWORD_2`
- `STORM_ADMIN_NAME_2`

V1.2 moves the Next.js `app/` directory to repository root for maximum builder compatibility and corrects API route imports. It also uses an OpenNext version compatible with Next.js 16.2.11 so the runtime DB binding helper can import `getCloudflareContext()`.

## V1.3 runtime fix

- Reads Webflow Cloud custom environment variables from `process.env`.
- Reads the D1 binding from `getCloudflareContext()` using the current Webflow Cloud pattern.
- Removes forced Next.js Edge-route declarations so Webflow Cloud/OpenNext can use its generated Workers runtime configuration.
- Adds `/api/health` for non-secret deployment diagnostics.
- Makes browser API error handling resilient to non-JSON platform errors.
