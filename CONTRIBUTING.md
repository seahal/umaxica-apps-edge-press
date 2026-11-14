# Contributing

Use Node.js `26.13.1` and pnpm `12.18.0`. Install from the repository root with `pnpm install`, then run `pnpm run check` before submitting a change. For browser-facing changes, also run `pnpm run test:api`; changes to rendering or browser-only behavior may need `pnpm run test:e2e`.

The repository owns only the twelve units under `app`, `com`, and `org` with surfaces `docs`, `help`, `info`, and `news`. Keep deployment units standalone: preserve their local tool configuration and do not add imports between units. Use `pnpm --dir <unit> run <script>` for focused work. `pnpm run lint:check` is the read-only linter; `pnpm run lint` applies fixes.

Read the relevant ADR and `AGENTS.md` before changing deployment boundaries. Keep Worker names, routes, bindings, secrets, and Wrangler environments intact unless the owner explicitly directs otherwise. Never commit secret values or generated Wrangler type declarations. Record completed verification in `evidence/` when the result is useful beyond the current change.
