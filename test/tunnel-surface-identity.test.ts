/** The public cells expose only the shared /health endpoint, not legacy JSON routes. */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = join(import.meta.dirname, '..');
const CELLS = ['app', 'com', 'org'].flatMap((brand) =>
  ['docs', 'help', 'info', 'news'].map((surface) => `${brand}/${surface}`),
);

describe('Press health routes', () => {
  it('covers exactly twelve public content cells', () => {
    expect(CELLS).toHaveLength(12);
  });

  it.each(CELLS)('%s exposes /health through the TanStack server route', (workspace) => {
    expect(existsSync(join(repoRoot, workspace, 'src/routes/health.ts'))).toBe(true);
    expect(existsSync(join(repoRoot, workspace, 'src/routes/health.startups.ts'))).toBe(true);
    expect(existsSync(join(repoRoot, workspace, 'src/routes/health.livenesses.ts'))).toBe(true);
    expect(existsSync(join(repoRoot, workspace, 'src/routes/health.readinesses.ts'))).toBe(true);
    expect(existsSync(join(repoRoot, workspace, 'src/routes/health[.]json.ts'))).toBe(false);
    expect(existsSync(join(repoRoot, workspace, 'src/app/health.json/route.ts'))).toBe(false);
  });
});
