# Press split and prune

Date: 2026-11-15  
Source commit: `8ebcdc1c29650fc7c1ae36fa6528f4c2eeba96b6`  
Source branch: `feature`  
Observed final branch: `develop`  
Observed final HEAD: `709c8eda64c608b601b445d6e0eb6f6da797cf40`

## Result

The workspace now contains the twelve Press cells only:
`{app,com,org}/{docs,help,info,news}`. The root package is
`umaxica-apps-edge-press`, with Node `26.13.1`, pnpm `12.18.0`, and Vite+ `1.6.0`.
`pnpm install` completed and reported the lockfile up to date.

Removed the five Apex units, three Core units, `all/busy`, and `tools/vpc-probe`,
along with their workspace entries and Press-only supporting scripts, tests,
and obsolete plan files. Kept the split decision and this work order. Updated
the retained development-auth guide to use a kept cell's `dev:vpc` entrypoint.

The twelve retained `wrangler.jsonc` files were parsed and compared with the
source commit. All 12 match semantically, including names, routes, bindings,
rate limits and environments. No kept package import from a deleted package
was found; Knip and the repository boundary suite passed.

## Vite+ and per-cell checks

Every cell passed a local `vp build`, TypeScript check, Vitest suite, Knip and
bundle-size check. Vitest reported 35 files and 408 tests per cell.

| Cell       | Build | Typecheck | Vitest | Knip | Size |
| ---------- | ----- | --------- | ------ | ---- | ---- |
| `app/docs` | PASS  | PASS      | PASS   | PASS | PASS |
| `app/help` | PASS  | PASS      | PASS   | PASS | PASS |
| `app/info` | PASS  | PASS      | PASS   | PASS | PASS |
| `app/news` | PASS  | PASS      | PASS   | PASS | PASS |
| `com/docs` | PASS  | PASS      | PASS   | PASS | PASS |
| `com/help` | PASS  | PASS      | PASS   | PASS | PASS |
| `com/info` | PASS  | PASS      | PASS   | PASS | PASS |
| `com/news` | PASS  | PASS      | PASS   | PASS | PASS |
| `org/docs` | PASS  | PASS      | PASS   | PASS | PASS |
| `org/help` | PASS  | PASS      | PASS   | PASS | PASS |
| `org/info` | PASS  | PASS      | PASS   | PASS | PASS |
| `org/news` | PASS  | PASS      | PASS   | PASS | PASS |

## Repository checks

- Format check: PASS for all cells and root files.
- Lint check: PASS for all cells and root `tools`, `test` and `vite.config.ts`.
- Generated Worker types: PASS for all 12 cells (`wrangler types --check`).
- Repository Vitest suite: PASS, 16 files and 245 tests.
- Worker manifest: PASS, 12 Press Workers.
- Dependency architecture: PASS when run directly.
- Dependency version sync: PASS.
- Spelling: PASS, 1,956 files checked and zero issues.
- `git diff --check`: PASS.

## Local execution limits

The installed pnpm 12.18.0 runtime is running under Node 26.12.0, while the
repository pins Node 26.13.1. `pnpm install` succeeded, but `pnpm run` could not
acquire the read-only package-manager store operation lock. The checks above
were run with the already-installed local executables; no tool was downloaded
to work around the lock.

The repository test process cannot spawn `depcruise` under this sandbox
(`spawnSync ... EPERM`). The same architecture command passed directly, and
the invariant suite then consumed that command's JSON output through
`EDGE_DEPCRUISE_OUTPUT_FILE`; its normal CI path still runs the binary. The
Worker checker similarly passed with `EDGE_TRACKED_FILES` supplied from the
shell's successful `git ls-files` command.

Wrangler generated and checked local types for all cells. Its optional log-file
write was denied by the read-only home configuration, without affecting the
type output or check result.

## Retained code notes

To keep existing behavior unchanged, the twelve public cells retain the
`core` localhost match in `src/lib/rails-staff-origin.ts`, the `core` member in
`EdgeService` in `src/lib/request-log.ts`, and Core-prefixed Paraglide message
entries. These remain after the Core package deletion and may need an owner
decision before removal.

## Owner Cloudflare removals

No Cloudflare action was taken. The owner can remove these deleted Workers by
their current names:

- `umaxica-apps-edge-app-apex`
- `umaxica-apps-edge-com-apex`
- `umaxica-apps-edge-org-apex`
- `umaxica-apps-edge-dev-apex`
- `umaxica-apps-edge-net-apex`
- `umaxica-apps-edge-app-core`
- `umaxica-apps-edge-com-core`
- `umaxica-apps-edge-org-core`
- `umaxica-apps-edge-all-busy`
- `umaxica-apps-edge-vpc-probe`

The shared checkout advanced locally to `709c8eda` (a direct child of the source
commit, subject `[UPGRADE] .`) during this work. It contains the tracked pruning
changes. I did not create, amend, reset or push that commit, and left it intact.
No deploy, remote Wrangler command or Cloudflare change was made.
