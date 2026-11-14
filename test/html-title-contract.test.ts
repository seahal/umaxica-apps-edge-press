/** Cross-cell title and rate-limit document invariants for Press. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = join(import.meta.dirname, '..');
const BRANDS = ['app', 'com', 'org'] as const;
const SURFACES = ['docs', 'help', 'info', 'news'] as const;
const TLD = { app: 'APP', com: 'COM', org: 'ORG' } as const;
const CELLS = BRANDS.flatMap((brand) =>
  SURFACES.map((surface) => ({ brand, surface, workspace: `${brand}/${surface}` })),
);
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const titleContract = /^(?:.+ — )?UMAXICA \((APP|COM|ORG)\)$/u;
const forbidden = /\b(?:auth|core|apex|edge|next|hono|workers?|cloudflare|opennext)\b/iu;

function expectDocumentTitle(html: string, brand: keyof typeof TLD, label: string) {
  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gu)].map(
    (match) => match[1] ?? '',
  );
  expect(titles, `${label}: expected one title`).toHaveLength(1);
  const title = (titles[0] ?? '').trim();
  expect(title, `${label}: title is empty`).not.toBe('');
  expect(title, `${label}: title does not match the Press contract`).toMatch(titleContract);
  expect(title, `${label}: brand does not match its audience`).toContain(`UMAXICA (${TLD[brand]})`);
  expect(title, `${label}: leaks a surface or runtime name`).not.toMatch(forbidden);
  expect(title, `${label}: needs a page-specific title`).toMatch(
    new RegExp(`^.+ — UMAXICA \\(${TLD[brand]}\\)$`, 'u'),
  );
}

describe('public content cell titles', () => {
  it('covers exactly the twelve Press cells', () => {
    expect(CELLS).toHaveLength(12);
    for (const { workspace } of CELLS) {
      expect(existsSync(join(repoRoot, workspace, 'api/title-contract.hurl'))).toBe(true);
      expect(existsSync(join(repoRoot, workspace, 'src/lib/title.ts'))).toBe(true);
    }
  });

  it.each(CELLS)('$workspace uses the audience title and route helper', ({ brand, workspace }) => {
    expect(read(`${workspace}/src/lib/publishing-cell.ts`)).toContain(
      `export const BRAND_TITLE = 'UMAXICA (${TLD[brand]})'`,
    );
    expect(read(`${workspace}/src/lib/title.ts`)).toContain(
      'return `${pageTitle} — ${BRAND_TITLE}`;',
    );
    expect(read(`${workspace}/src/routes/__root.tsx`)).not.toMatch(/head:[\s\S]*?title:/u);
  });

  it.each(CELLS)(
    '$workspace returns a titled no-store 429 document',
    async ({ brand, workspace }) => {
      const { checkRateLimit } = (await import(
        /* @vite-ignore */ `../${workspace}/src/lib/rate-limit.ts`
      )) as {
        checkRateLimit: (
          request: Request,
          limiter: unknown,
          locale?: () => string,
        ) => Promise<Response | null>;
      };
      const blocked = { limit: async () => ({ success: false }) };
      const response = await checkRateLimit(new Request('https://example.test/'), blocked);
      expect(response?.status).toBe(429);
      expect(response?.headers.get('content-type')).toContain('text/html');
      expect(response?.headers.get('cache-control')).toBe('no-store');
      expectDocumentTitle(await (response as Response).text(), brand, `${workspace} 429`);

      const otherLocale = await checkRateLimit(
        new Request('https://example.test/'),
        blocked,
        () => 'en',
      );
      const html = await (otherLocale as Response).text();
      expect(html).toContain('<html lang="en"');
      expectDocumentTitle(html, brand, `${workspace} 429 in English`);
    },
  );
});
