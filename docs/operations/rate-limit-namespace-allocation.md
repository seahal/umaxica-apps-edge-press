# Rate-limit namespace allocation

This is the normative table for the twelve Press Workers' Cloudflare Rate Limiting `RATE_LIMITER` namespace ids. The account-wide allocation rule is in [ADR 022](../../adr/022-rate-limit-namespace-allocation.md). `umaxica-apps-edge-jump` is a separate Worker; its production id is reserved here to prevent a collision.

A rate-limit counter is scoped to the Cloudflare account and keyed by (`namespace_id`, key). Each Press Worker and environment therefore needs a unique id. `tools/check-workers.mjs` derives each id from the existing `scripts.dev --port` value and the environment prefix.

## Format

Production uses `<dev-port>00`. The final `00` is the Global region suffix. Non-production prefixes the six-digit id:

| Prefix | Environment |
| ------ | ----------- |
| none   | production  |
| `2`    | development |
| `3`    | test        |
| `4`    | vpc         |
| `5`    | local       |

For example, `app/docs` listens on port `5406`:

```text
production  = 540600
development = 2540600
test        = 3540600
vpc         = 4540600
local       = 5540600
```

The TLD and surface digits are the existing development-port allocation:

| Code | TLD or surface |
| ---- | -------------- |
| `51` | `com`          |
| `53` | `org`          |
| `54` | `app`          |
| `03` | `info`         |
| `06` | `docs`         |
| `07` | `news`         |
| `08` | `help`         |

## Production allocation

```text
com/docs = 510600    com/help = 510800    com/info = 510300    com/news = 510700
org/docs = 530600    org/help = 530800    org/info = 530300    org/news = 530700
app/docs = 540600    app/help = 540800    app/info = 540300    app/news = 540700
```

The separate Jump Worker reserves `520900`. Historical ids `999` and `1006` are retired and must not be reused. Every Press `RATE_LIMITER` keeps its existing budget of 2000 requests per 60 seconds; the rate-limit policy is not part of namespace allocation.

## Adding a Press cell

1. Choose an unused TLD or surface code and the matching four-digit development port.
2. Use the same port-derived id with the correct prefix in every environment already configured for that Worker.
3. Keep every namespace unique across Press and the reserved Jump id.
4. Update this page and the unit's configuration together, then run `pnpm run check:workers`.
