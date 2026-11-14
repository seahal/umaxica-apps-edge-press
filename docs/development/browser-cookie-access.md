# Browser cookie access

Browser code in the Press Workers uses the Cookie Store API (`cookieStore`) when cookie access is necessary. Do not use `document.cookie`, add a cookie library, or introduce a wrapper before a feature needs one.

The public content cells do not issue, refresh, or delete preference cookies. Rails remains responsible for preference persistence. A Rails-owned response may preserve Rails `Set-Cookie` headers as allowed by the existing response path; Press application code must not create its own preference cookie contract.

Keep browser cookie handling inside browser-only code. Never read or mutate cookies during server rendering, and do not forward browser session cookies from a public content request to Rails. The public pages make anonymous, read-only content requests. See [Public Information Surfaces](../public-information-surfaces.md) and [UI shell contract](../design/ui-shell-contract.md).
