# Architecture Decision Records

This directory contains decisions relevant to the twelve Press Workers and their local development environment. Records moved with another repository are retained only where a Press record links to their history; their banner identifies the new owner.

## Press decisions

- [ADR 005](005-rails-edge-workers-vpc-connection.md) — Rails over Workers VPC
- [ADR 006](006-development-workers-vpc-transport.md) — development VPC transport
- [ADR 008](008-edge-development-tunnel-exposure.md) — development Tunnel exposure
- [ADR 009](009-rails-health-entrypoint-and-dispatch-operability.md) — Rails health and dispatch operability
- [ADR 010](010-first-touch-rate-limiting.md) — first-touch rate limiting
- [ADR 013](013-frames-tanstack-start.md) — TanStack Start on Vite
- [ADR 014](014-edge-owned-development-tunnel.md) — Edge-owned development Tunnel
- [ADR 015](015-public-content-surfaces-astro.md) — earlier public-surface decision; superseded by ADR 019
- [ADR 016](016-rails-machine-health-api.md) — Rails machine health API
- [ADR 017](017-edge-self-health-api.md) — Edge self-health API
- [ADR 019](019-edge-parallel-contract-boundaries.md) — Press runtime and Rails boundaries
- [ADR 020](020-wrangler-device-login.md) — Wrangler device login
- [ADR 021](021-hsts-preload.md) — HSTS preload
- [ADR 022](022-rate-limit-namespace-allocation.md) — rate-limit namespace allocation
- [ADR 025](025-csp-report-ownership.md) — CSP report ownership
- [ADR 026](026-tanstack-start-stable-caret-range.md) — TanStack Start version range

## Moved records

- [ADR 001](001-rails-health-check.md) — Apex health-page proposal, moved to `umaxica-apps-edge-zenith`
- [ADR 002](002-dev-apex-vercel.md) — dev Apex history, moved to `umaxica-apps-edge-zenith`
- [ADR 003](003-apex-direct-composition.md) — Apex composition, moved to `umaxica-apps-edge-zenith`
- [ADR 011](011-apex-workers-stay-hono.md) — Apex runtime, moved to `umaxica-apps-edge-zenith`
- [ADR 012](012-apex-vite-build-and-static-assets.md) — Apex build, moved to `umaxica-apps-edge-zenith`
- [ADR 024](024-retire-app-com-org-apex-units.md) — Apex retirement history, moved to `umaxica-apps-edge-zenith`
- [ADR 027](027-reintroduce-app-com-org-apex-units.md) — Apex reintroduction history, moved to `umaxica-apps-edge-zenith`
- [ADR 007](007-shared-fqdn-core-dispatch.md) — Core dispatch, moved to `umaxica-apps-edge-sphere`
- [ADR 018](018-core-rails-direct-internet.md) — Core Rails transport, moved to `umaxica-apps-edge-sphere`

## Historical proposals

- [ADR 004](004-public-information-surfaces-astro.md) — rejected framework proposal, superseded by ADR 015 and ADR 019

The records are named `NNN-short-title.md`. Decisions are documented independently from work plans and are not automatically moved out of `plans/`.
