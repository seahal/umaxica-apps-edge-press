# TanStack Start: twelve-unit verification

Date: 2026-11-14. Base HEAD: `8ebcdc1c29650fc7c1ae36fa6528f4c2eeba96b6`.
Checks used the existing working tree, which already contained repository-split changes.
Scope: `{app,com,org}/{docs,help,info,news}`.

## Repairs

- Aligned the Vite catalog with the Vite+ 1.6.0 core alias and refreshed the pnpm lockfile. A reinstall alone retained the incompatible direct Vite resolution.
- Made format and lint scripts explicitly read each unit’s own configuration. Restricted root lint to root tooling and tests.
- Preserved lazy build plugins and supplied an empty plugin list when lazy loading returns undefined, satisfying exact optional property types.
- Removed unused direct formatter and linter dependencies; Vite+ supplies these tools.
- Updated repository invariants for twelve content units, deleted working-tree files, and the `vp` binary provider.
- Aligned the Worker checker with the existing 10% logs / 2% traces configuration and disabled invocation logs. Worker configuration was not changed.
- Ignored Wrangler-generated environment declarations at the root, including leftovers from moved units.
- Applied repository formatting.

## Results

- `taskset -c 0-3 pnpm run check`: complete local gate passed (exit 0), including all twelve unit suites and the root suite.

- `pnpm exec intent list` and `pnpm exec intent load @tanstack/react-start#react-start`: installed skill loaded.
- `pnpm run build`: all twelve production Worker builds passed after the repairs.
- `pnpm run check:size`: all twelve passed; client gzip sizes were below the 150 kB budget.
- `pnpm run test`: all twelve unit suites passed, 408 tests per unit (4,896 total). The repaired root suite passed separately with `pnpm run test:repo`: 244 passed, one skipped.
- `pnpm -r --workspace-concurrency=1 run test:api`: all twelve passed, 1,428 HTTP requests including nonce isolation checks.
- `pnpm -r --workspace-concurrency=1 run test:e2e`: all twelve passed, 13 Chromium tests each (156 total). Installed the matching Chromium browser with `pnpm --dir app/docs exec playwright install chromium` first.
- Format, lint, generated declarations, TypeScript, Knip, Worker policy, architecture, dependency consistency, and spelling checks passed in the final static gate.
- `git diff --check`: passed.

Verification commands were run with CPU affinity limited using `taskset` after overlapping checks exhausted process capacity (`EAGAIN`). Browser and HTTP suites used the local tier. They verify rendering, search, accessibility behavior, security headers, and unavailable-backend behavior; they do not establish live Rails content rendering over VPC.
