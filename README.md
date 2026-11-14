# Umaxica Edge Press

This repository owns twelve public content Workers: `app`, `com`, and `org`, each with `docs`, `help`, `info`, and `news`. Every unit is a standalone TanStack Start application built with Vite+ and deployed to Cloudflare Workers. Worker names, routes, bindings, and Wrangler environments remain as configured in each unit.

## Workspace

| Audience | Docs       | Help       | Info       | News       |
| -------- | ---------- | ---------- | ---------- | ---------- |
| `app`    | `app/docs` | `app/help` | `app/info` | `app/news` |
| `com`    | `com/docs` | `com/help` | `com/info` | `com/news` |
| `org`    | `org/docs` | `org/help` | `org/info` | `org/news` |

Each unit owns its Vite, TypeScript, Vitest, Oxlint, Oxfmt, and Knip configuration. The units do not import code from one another. `test/publishing-cells.test.ts` checks the twelve-cell matrix and shared-file parity.

The public surfaces render content from Rails through the Workers VPC binding. Rails remains the authority for persisted content, publishing operations, and authorization. The Edge units make server-side read requests and do not forward browser sessions. See [Public Information Surfaces](docs/public-information-surfaces.md), [ADR 019](adr/019-edge-parallel-contract-boundaries.md), and [the publishing read path](docs/development/publishing-read-path.md).

## Requirements

- Node.js `26.13.1`
- pnpm `12.18.0`
- Chromium for local Playwright browser tests

Install dependencies and hooks from the workspace root:

```bash
pnpm install
pnpm exec lefthook install
```

## Development

| Audience | Docs | Help | Info | News |
| -------- | ---: | ---: | ---: | ---: |
| `com`    | 5106 | 5108 | 5103 | 5107 |
| `org`    | 5306 | 5308 | 5303 | 5307 |
| `app`    | 5406 | 5408 | 5403 | 5407 |

Start one unit on the host:

```bash
pnpm --dir app/docs run dev
```

The rootless Podman environment is optional. `scripts/dev-start` starts the shared workspace container; `scripts/dev-start --tunnel` also starts the repository's Cloudflare Tunnel connector. The `app` Compose profile runs one container per unit. Do not put credentials in tracked configuration; the tunnel token is read from the local, ignored `.env` file.

## Checks

Vite+ provides `vp` for formatting, linting, tests, development, and production builds. Root scripts fan out over the twelve standalone units. Use `lint:check` in review and CI; `lint` applies fixes.

```bash
pnpm run format:check
pnpm run lint:check
pnpm run typecheck
pnpm run knip
pnpm run test
pnpm run check:architecture
pnpm run check:spelling
```

`pnpm run check` runs static checks and unit tests. `pnpm run test:api` runs the Hurl HTTP contracts. `pnpm run test:e2e` runs Playwright tests and requires Chromium. To build each production Worker locally and check its size budget, run:

```bash
pnpm run build
pnpm run check:size
```

Builds run `vp build`; production runs the resulting Worker and does not start Node.js. The root test suite under `test/` owns repository-wide invariants. Each unit owns its Vitest suite, Hurl API suite, and Playwright browser suite.

## Architecture and operations

- [Development environment](docs/development/development-environment-overview.md)
- [Cloudflare development network](docs/development/cloudflare-development-network.md)
- [Cloudflare Tunnel](docs/operations/cloudflare-tunnel-development.md)
- [Rate-limit namespace allocation](docs/operations/rate-limit-namespace-allocation.md)
- [Static analysis policy](docs/development/static-analysis-and-hygiene.md)
- [Security reporting](SECURITY.md)

Completed verification records belong in the flat `evidence/` directory. The split decision and this repository's work order remain in `plans/` for traceability.
