# Press Worker rename

Date: 2026-11-15

Renamed the twelve existing Workers in account `c90999d8a4039c63d02b7a7b1545d211`
in place with `PATCH /accounts/{account}/workers/workers/{id}`. No Worker was
created. Worker IDs, routes, version history, and the active production
deployment carried over (`wrangler deployments status --name <new>` showed the
same 100% version as before).

| Worker ID                        | Old                        | New                              |
| -------------------------------- | -------------------------- | -------------------------------- |
| d9e852fed5174a65992292b303ed744c | umaxica-apps-edge-app-docs | umaxica-apps-edge-press-docs-app |
| 1785953cdbeb406ea3aed065ae65d486 | umaxica-apps-edge-app-help | umaxica-apps-edge-press-help-app |
| 7ac57aefa0364e9c9d16be353e03da9b | umaxica-apps-edge-app-info | umaxica-apps-edge-press-info-app |
| 7fcbe593bb3348ff99ac8c2e81181dbd | umaxica-apps-edge-app-news | umaxica-apps-edge-press-news-app |
| 45ee688a038444a686b2350d984a0683 | umaxica-apps-edge-com-docs | umaxica-apps-edge-press-docs-com |
| d145972c364a4d999193ea0b3678715f | umaxica-apps-edge-com-help | umaxica-apps-edge-press-help-com |
| f2b6267969dc400cbba4ea32903e0323 | umaxica-apps-edge-com-info | umaxica-apps-edge-press-info-com |
| c4cedbfd614c43d198b50c7729a53b65 | umaxica-apps-edge-com-news | umaxica-apps-edge-press-news-com |
| e3afce2eb55145618c3322ea621cb7dc | umaxica-apps-edge-org-docs | umaxica-apps-edge-press-docs-org |
| 4ab8a0a4d3ba401d854a5e7fd827d32b | umaxica-apps-edge-org-help | umaxica-apps-edge-press-help-org |
| 00c110e5c364410a9eca385c52ef3b3a | umaxica-apps-edge-org-info | umaxica-apps-edge-press-info-org |
| 1835ae3e1a784f129a72e9cd884b78d6 | umaxica-apps-edge-org-news | umaxica-apps-edge-press-news-org |

Repository: `wrangler.jsonc` and `package.json` names, root `--filter` scripts,
`test/cell.test.ts` name assertions, and ADR 006 commands updated.

Preview: `pnpm run deploy:edge:preview -- <unit>` (no `--bootstrap-missing`)
exited 0 for all twelve units. Production promotion was not run.

## Workers Builds repository switch

Through the Cloudflare API MCP server (scope `workers-ci.write`), registered
repository connection `98dcd1c6-bb90-427e-a5d9-273addb627fb` for
`seahal/umaxica-apps-edge-press` (GitHub repo ID `1455489610`). All 24 triggers
(two per Worker) previously pointed at `seahal/umaxica-apps-edge` (repo ID
`838495664`). The API cannot change a trigger's repository and limits each Worker
to two triggers, so each trigger was deleted and recreated with the same name,
build token, branch filters, root directory, and deploy command. A read-back
showed all twelve Workers with a `main` trigger running `deploy` and a `*`
trigger running `deploy:upload`, both on the new repository.
