# Press design guidance

Design work in the twelve public content cells follows [the UI shell contract](docs/design/ui-shell-contract.md) and the unit's local Tailwind CSS v4 theme. Keep the shared shell and page patterns consistent across all twelve cells; audience and surface-specific copy belongs in the cell's `publishing-cell.ts` and message catalog.

Each deployment unit owns its stylesheet and design tokens. Use Tailwind utilities in markup, preserve keyboard and focus behavior, and verify both `ja` and `en` layouts. See [keyboard guidelines](docs/design/keyboard-guidelines.md), [search metadata](docs/design/search-metadata.md), and [public information surfaces](docs/public-information-surfaces.md).
