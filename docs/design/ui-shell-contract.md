# UMAXICA Press UI shell contract

**Status: normative for the twelve public content cells**
`{app,com,org}/{docs,help,info,news}`. Each cell is a standalone TanStack Start
application. The shell and design rules in this document apply to all twelve;
the content and brand values come from the cell's local configuration.

Keyboard interaction also follows the [keyboard guidelines](keyboard-guidelines.md).

## 1. Shell structure

Every rendered page document has one `<header>`, one `<main>` and one `<footer>`,
in that order. The unit's `test/ui-shell-contract.test.tsx` asserts the document
landmarks, accessible names and links. `test/publishing-cells.test.ts` checks
that the shared implementation remains byte-identical across the twelve cells.

- The first focusable element is a skip link to `#main-content`. The main
  element has `id="main-content"` and `tabindex="-1"`, so activating the link
  moves focus to the page content.
- The header contains the brand link, the product label and a named primary
  navigation for Home, Entries and Search. The brand is a link, not the page's
  heading. The current destination uses `aria-current="page"`.
- The footer contains a named utility navigation with the existing About page,
  followed by the copyright and canonical home URL. Do not link to Privacy or
  Terms until those pages exist.
- Use native links and buttons. Publishing links are ordinary `<a>` elements
  and perform full document requests; page data is loaded on the server.

The root route owns the document shell. Not-found, error and offline documents
render inside that shell. Machine endpoints such as `/health` and `/revision`
have their own response contracts and are not shell pages.

## 2. Language and page metadata

Localized pages use the `ja` or `en` path prefix, and the document's `lang`
matches that prefix. The root route negotiates `Accept-Language` and redirects
to a localized page. Do not infer the locale from cookies or a hostname.

Each page owns its title and description. `brandTitle()` appends the cell's
brand title with an em dash; the root route does not add a second title.
`documentHead()` emits the canonical URL and language alternates for the same
page. Search results with a query are marked `noindex, follow`. Failure
documents are `noindex, nofollow` and do not claim a canonical URL.

Keep route metadata in the route's `head` option and use the shared local
helpers in `src/lib/title.ts` and `src/lib/seo.ts`. The unit's
`api/title-contract.hurl`, `api/standard-contract.hurl` and the repository
`test/html-title-contract.test.ts` protect the emitted document contract.

## 3. Styling

Each cell owns its stylesheet and its `@theme` tokens. Keep these local copies
standalone; do not introduce a shared UI package or Tailwind preset.

### 3a. Normative styling rules

- Tailwind CSS v4 is the styling layer. Use `@tailwindcss/vite` from the unit's
  Vite config.
- Express visual rules as Tailwind utilities in markup. Do not add CSS Modules,
  CSS-in-JS, `tailwind.config.*`, static `style=` attributes or `@apply`.
- A new CSS rule needs a written reason a utility cannot express it. Repeated
  utility runs become a component, not a custom class.
- Put design constants in the unit's `@theme`. `--color-brand` is the one
  colour pinned by literal value (`#2563eb`); other theme choices stay in the
  local stylesheet.
- Do not share or centralize per-unit stylesheets or theme configuration.

These rules are also recorded in the root `AGENTS.md` styling section. The
source stylesheet and the unit tests remain the evidence for current behavior.

## 4. Accessibility and interaction

Use semantic HTML and preserve browser keyboard behavior. Every interactive
control needs an accessible name and a visible focus state. Navigation regions
must have distinct accessible labels. Keep the skip link first in tab order and
make sure it reaches a focusable main element.

Do not add keyboard shortcuts, menus, dialogs or client-side navigation unless
the feature needs them. If a control is introduced, document its keyboard
behavior in the change and follow the keyboard guidelines.

## 5. Change scope and verification

Change the corresponding source in all twelve cells together, unless the
difference is explicitly owned by `src/lib/publishing-cell.ts` or its message
catalog. Run the unit's UI shell test and the root cell-parity invariant for a
shell change. HTTP response assertions belong in the unit's Hurl suite; browser
only behavior belongs in Playwright.
