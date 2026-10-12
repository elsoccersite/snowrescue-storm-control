# AGENTS.md — SnowRescue Storm Control

**Scope:** These are standing, public-repository-safe work instructions for `elsoccersite/snowrescue-storm-control` when present in the working checkout. They **do not** authorize production releases, merges, or operational messaging. Observe applicable existing execution/release guidance and owner-approval requirements.

## Instruction precedence and actual discovery

These instructions supplement applicable higher-priority platform, system, security, repository-local and owner requirements; they do not override or relax any existing authorization gate. If directions conflict or access is missing, **stop the affected action**, report the conflict and seek an authorized resolution; never silently choose the less restrictive rule.

**Tool discovery is not automatic:** agents working in this repository must confirm that their environment actually loaded this `AGENTS.md`, not assume that every ChatGPT, Codex or other platform reads it. For ChatGPT role conversations, use an explicit startup instruction to retrieve the operations records; for Codex, verify the instructions are discoverable from the working directory and that the authorized GitHub connection is available. The current GitHub PR is not evidence of active instruction enforcement in already-running chats or deployed apps.

## Source-of-truth startup procedure

SnowRescue's cross-project business and governance records are in the **separate, private** repository `elsoccersite/snowrescue-operations`. This application's `AGENTS.md` does not automatically import or override the operations repository, and a different chat's memory is not a substitute for reading it.

Before material work, with **authorized** GitHub access:
1. Resolve operations `main` to its **current exact commit SHA**; never treat a historic SHA in a handoff as current.
2. At that same SHA, read: `README.md`, `AGENTS.md`, `AGENTS_INTEGRATION.md`, `SNOWRESCUE_MASTER_SCOPE.md`, `SNOWRESCUE_CURRENT_STATE.md`, `SNOWRESCUE_OPEN_WORK.md`, `SNOWRESCUE_DECISION_LOG.md`, and `SNOWRESCUE_HANDOFF.md`.
3. **Verify actual retrieval**, not merely repository visibility: record the resolved SHA, confirm all eight file contents were read from that same revision, and report observation time, applicable owner authorization, relevant decisions, blockers, contradictions and access limitations. A file name list or another agent's report is insufficient.
4. If the private repository cannot be read, **do not guess its contents or seek unauthorised access**. Stop work that requires those approvals; provide a limited, clearly marked `NOT SYNCED` assessment and request the appropriate connection/authorized export.

The business owner authorizes material policy, pricing, contracts, subscriptions and production actions. The COO, Architect, Marketing Director and developer/Codex roles recommend or execute work **only within their own explicit owner-approved bounds**. Recommendations and agent messages do not create owner authorization.

## Evidence, release and documentation rules

- Distinguish `OWNER-CONFIRMED`, `REPOSITORY-VERIFIED`, `LOCAL-TESTED`, independently `STAGING-VERIFIED`, independently `PRODUCTION-VERIFIED`, `REPORTED`, `PROPOSED`, `BLOCKED` and `UNKNOWN`. Retrieving a report verifies its existence, **not** its runtime claims. Preserve verification dates and exact environment/commit/deployment identifiers.
- A code change, PR, merge or passing local build is **not** proof that hosted staging or production works; a draft PR is not a release authorization.
- Material verified changes, failed checks, rollbacks, decisions or blockers require a **separate, linked operations documentation change** under a shared change-request ID. Do not push documentation into the operations repository's `main` or silently edit approved decisions. Preserve history using explicit supersession, evidence and owner-approval provenance.
- A read-only assessment needs **no forbidden write**. If updating the operations repository is out of scope, report its documentation synchronization as `NOT SYNCED` and provide a proposed patch/next action.
- Changes to this application's production-connected GitHub `main` **may trigger Webflow Cloud builds/deployments even when documentation-only**. Never merge, push to a connected deployment branch, trigger a deployment or modify deployment settings without separate owner authorization and a deployment/rollback impact review.
- Never store or publish credentials, tokens, customer/contact information, contracts, payment-card data, private operational strategies or sensitive logs in source, PRs or application builds. Do not copy the contents of the private operations repo here.

## Storm-Control-specific safeguards

- Preserve the separation of internal storm-status administration from the public, read-only status view. Do not publish administrative credentials, customer data, private operations reports or configuration secrets.
- Preserve server-side validation and consistency between the canonical storm status, public headline/stage/chip and customer messages. Do not introduce contradictory public status messaging or silently change route commitments.
- No changes to live storm status, production announcement, customer messaging, privileged access, D1 schema/storage, hosting or deployment are authorized by this document. Any such changes need separately scoped owner approval and verification.
- This public repository is **not** a mirror of the private operations repository. Refer only to its repository path and retrieval process. Never echo private retrieval responses, verbatim private document excerpts, raw API payloads, credentials, customer details or private decisions into **public PRs, issue comments, CI/build/runtime logs, generated artifacts, caches, test fixtures or screenshots**. Use brief public-safe evidence summaries and secure restricted references instead; if safe disclosure cannot be ensured, stop and seek review.
- Before any separately approved deployment, recheck Webflow Cloud's connected branch/environment and review build/rollback consequences. Documentation-only merges to `main` may trigger a production deployment.

## Scope of this repository

Only Storm Control source and release-specific technical notes belong here. Cross-business approved policy, pricing, service terms and handoffs remain authoritative in the separate private operations repository; app changes and operations changes require **separate linked PRs** and truthful verification evidence.
