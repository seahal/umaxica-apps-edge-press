# Page metadata in Umaxica Press

The twelve Press cells render their own HTML documents with TanStack Start.
Metadata belongs to the route that renders each document and is defined in that
route's `head` option. This is an implementation guide for the current source,
not a proposal for an additional metadata framework.

## Current contract

- `src/lib/title.ts` appends the cell's `BRAND_TITLE` to the page title with an
  em dash. Every document has exactly one `<title>`.
- `src/lib/seo.ts` provides `documentHead()` for localized pages. It emits a
  description, a self-referencing canonical URL and `ja`, `en`, and `x-default`
  alternates for that same path.
- Search pages with a non-empty query use `noindex, follow`. Failure documents
  use `noindex, nofollow` and do not emit a canonical URL.
- The root document owns shared stylesheet, manifest and favicon links. Route
  metadata adds page-specific values through TanStack Start's `head` option.
- Canonical URLs use the cell's configured public origin. Do not derive them
  from the incoming Host header or a private development hostname.

The route code and metadata tests are the source of truth. Use
`api/title-contract.hurl`, `api/standard-contract.hurl`,
`test/standard-metadata.test.ts`, and the root
`test/html-title-contract.test.ts` when changing this contract.

## Adding metadata

Add only metadata supported by the page's content and public URL contract.
Open Graph fields, structured data and JSON-LD are not part of the shared helper
today. A proposal for them should identify the owning route, source of each
value, localization behavior and a test that checks the emitted document.

Search metadata does not transfer Rails authority to Edge. Rails remains the
source for persisted entry content; the public page renders metadata from the
same selected entry data it renders in the body.
