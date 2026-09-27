# SnowRescue Storm Control V1.4

V1.4 makes the Storm Status authoritative and prevents contradictory customer messaging.

## Behaviour

- Each Storm Status automatically controls the public headline, chip, stage, and primary customer message.
- Primary status messages cannot be manually mismatched.
- Optional operational updates are separate from status:
  - Heavy accumulation delay
  - Road access delay
  - Custom operational update
- Changing Storm Status automatically re-synchronizes the primary message and clears any stale custom update.
- Server-side validation rejects mismatched primary presets even if a malformed client request is submitted.
- Public API always derives title/chip/stage from Storm Status.
- Existing D1 schema is retained; no new migration is required.
