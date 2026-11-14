<!-- intent-skills:start -->

## Skill Loading

Use the repository's installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement. Before a substantial edit, run `pnpm exec intent list` from the workspace root. Load a matching listed skill with `pnpm exec intent load <package>#<skill>` and follow its `SKILL.md`. For a monorepo change, check from the workspace root and prefer the most specific local skill.

<!-- intent-skills:end -->

# Repository Instructions

This repository owns twelve TanStack Start public content Workers: `{app,com,org}/{docs,help,info,news}`. They run on Cloudflare Workers and are built with Vite+. Do not reintroduce units owned by another repository.

## Toolchain and commands

pnpm is the only package manager. Do not use npm, npx, yarn, or bun. `pnpm-lock.yaml` is the only lockfile. The supported versions are Node.js `26.13.1` and pnpm `12.18.0`.

- Install dependencies: `pnpm install`
- Complete local gate: `pnpm run check`
- Format: `pnpm run format` / `pnpm run format:check`
- Lint: `pnpm run lint` applies fixes; `pnpm run lint:check` is read-only
- Type check: `pnpm run typecheck`
- Unit tests: `pnpm run test`; coverage per unit with `pnpm --dir <unit> run test:cov`
- HTTP contracts: `pnpm run test:api` (Hurl)
- Browser tests: `pnpm run test:e2e` (Playwright; install Chromium with `pnpm exec playwright install chromium` when needed)
- Production bundles: `pnpm run build`; size budgets: `pnpm run check:size` after a build
- Repository checks: `pnpm run knip`, `pnpm run check:architecture`, `pnpm run check:deps`, and `pnpm run check:spelling`
- Per unit: `pnpm --dir <unit> run <script>` or `pnpm --filter <workspace> run <script>`

The root scripts fan out over the twelve independent units. `check:architecture`, `check:deps`, and `check:spelling` run once at the root. Root-level tests live in `test/`; unit tests live under each unit's `test/`. Import test utilities from `vitest` directly.

## Deployment boundaries

Each unit owns its `.oxlintrc.json`, `.oxfmtrc.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, and `knip.jsonc`. Do not replace these with root `extends` files or shared packages. The root lint, format, and TypeScript configuration applies only to repository-level files.

Every unit is an independent deployment. Do not change its Worker name, routes, bindings, secrets, or Wrangler environments as part of repository pruning. `vp build` creates the production Worker bundle and hashed client assets; the production runtime does not start Node.js. The Vite+ plugin list in each unit's Vite config is loaded lazily to keep `vp fmt` and `vp lint` independent of the build plugins.

## Test placement

| Check            | Tool                     | Location       | Assertion                                                     |
| ---------------- | ------------------------ | -------------- | ------------------------------------------------------------- |
| Unit logic       | Vitest via `vp test run` | `<unit>/test/` | Internal logic and injected Workers bindings                  |
| HTTP contract    | Hurl                     | `<unit>/api/`  | Status, headers, body, cookies, redirects, and response shape |
| Browser behavior | Playwright               | `<unit>/e2e/`  | Rendering, accessibility tree, and browser-only behavior      |

Response assertions belong in Hurl against a real server; they must not import `src/` or call `app.request()`. Vitest may use `app.request()` only when an HTTP client cannot create the condition under test, with a comment explaining why. Do not duplicate behavior across layers unless each layer catches a distinct failure.

## Runtime and UI conventions

- Read `docs/development/static-analysis-and-hygiene.md` before adding a suppression or ignore.
- Browser code accesses cookies only through the Cookie Store API. Read `docs/development/browser-cookie-access.md` before adding browser cookie code.
- Tailwind CSS v4 is the only styling layer. Do not add CSS Modules, CSS-in-JS, `tailwind.config.*`, static `style=` attributes, or `@apply`. Each unit owns its stylesheet and `@theme` tokens.
- `no-console` is an error. Request-boundary logs use each unit's closed, typed `src/lib/request-log.ts` emitter. Do not widen log fields to free-form strings or log secrets, user identifiers, hostnames, request bodies, or cookies.
- Mixin-style modules stay side-effect-light. Callers wire mutation, registration, persistence, and I/O explicitly; export the smallest useful surface.
- Keep generated `src/routeTree.gen.ts` committed. Wrangler-generated environment declarations are gitignored and must not be committed.

## Evidence

When a completed check or audit is useful to retain, write a short Markdown record under flat `evidence/` as `YYYY-MM-DD-<topic>.md`. Record only work actually performed. Include commands, identifiers, hashes, and results; summarize logs instead of adding raw logs or generated artifacts. A blocked check should name its reason and observed state.
