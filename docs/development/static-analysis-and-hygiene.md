# Static analysis and repository hygiene

This document records the ownership of the repository's static checks. Read it before adding a suppression or ignore.

## Commands

- `pnpm run format:check` runs Vite+ formatting for each unit and root files.
- `pnpm run lint:check` runs read-only type-aware Vite+ linting.
- `pnpm run typecheck` regenerates Wrangler types and runs TypeScript for each unit.
- `pnpm run knip` checks each unit's unused files, exports, and dependencies.
- `pnpm run check:workers` validates the twelve Wrangler configurations against the Press policy.
- `pnpm run check:architecture` checks the JavaScript tools and twelve Hurl runners.
- `pnpm run check:deps` enforces the pnpm catalog.
- `pnpm run check:spelling` checks repository prose and source with the root CSpell dictionary.
- `pnpm run test` runs every unit's Vitest suite and the root invariant suite.

CI calls read-only scripts. `pnpm run lint` and `pnpm run format` may rewrite files; `pnpm run fix:deps` is local-only.

## Configuration ownership

Each of the twelve units owns `.oxlintrc.json`, `.oxfmtrc.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`, and `knip.jsonc`. Do not centralize those files or make a unit depend on a root configuration. `test/deployment-unit-boundaries.test.ts` checks that each unit remains standalone.

The JavaScript dependency graph is small: `tools/` plus one `api/run.mjs` in each unit. Dependency-cruiser is limited to JavaScript because the installed TypeScript 7 compiler API is not supported by the current parser. `test/dependency-architecture-invariants.test.ts` guards against the graph going empty.

## Suppressions and generated files

Before adding a suppression, confirm that the finding is in code this repository owns, that the tool is configured to inspect the file, and that a local fix or more precise rule cannot express the intent. Document a necessary exception at the narrowest scope and remove it when its reason expires.

Keep `src/routeTree.gen.ts` committed. Wrangler environment declarations are generated and gitignored; never commit them. Generated public assets are checked by the Worker configuration gate and must be reproducible from each unit's sources.
