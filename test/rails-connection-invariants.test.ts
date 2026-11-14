/** Configuration invariants for the twelve Press cells' Rails VPC path. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { readWranglerConfig } from '../tools/lib/wrangler-config.mjs';

const repoRoot = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const BRANDS = ['app', 'com', 'org'] as const;
const SURFACES = ['docs', 'help', 'info', 'news'] as const;
const CELLS = BRANDS.flatMap((brand) =>
  SURFACES.map((surface) => ({ brand, surface, workspace: `${brand}/${surface}` })),
);
const manifest = JSON.parse(read('tools/workers-manifest.json')) as {
  railsBackedVpcVite: string[];
  vpcBinding: string;
  vpcDevelopmentServiceId: string;
  vpcProductionServiceId: string;
};

type VpcEntry = { binding?: string; service_id?: string; remote?: boolean };

function bindingsAt(workspace: string, tier: 'top' | 'development' | 'vpc' | 'test' | 'local') {
  const { config, error } = readWranglerConfig(join(workspace, 'wrangler.jsonc'));
  expect(error, `${workspace}/wrangler.jsonc`).toBeUndefined();
  const block = tier === 'top' ? config : config?.env?.[tier];
  return ((block?.vpc_services ?? []) as VpcEntry[]).filter(
    (entry) => entry.binding === manifest.vpcBinding,
  );
}

function privateRailsOrigin(workspace: string): string | undefined {
  const source = read(`${workspace}/src/lib/publishing-cell.ts`);
  return /export const PRIVATE_RAILS_ORIGIN = ('[^']+');/u.exec(source)?.[1];
}

describe('Press Rails VPC connection', () => {
  it('keeps the manifest scoped to all twelve Press cells', () => {
    expect(manifest.railsBackedVpcVite).toEqual(CELLS.map(({ workspace }) => workspace));
  });

  it.each(CELLS)(
    '$workspace uses its audience and surface Rails host',
    ({ brand, surface, workspace }) => {
      expect(existsSync(join(repoRoot, workspace, 'wrangler.jsonc'))).toBe(true);
      expect(privateRailsOrigin(workspace)).toBe(`'http://${surface}.${brand}.localhost:3000'`);
    },
  );

  it.each(CELLS)('$workspace keeps the production VPC binding unchanged', ({ workspace }) => {
    const entries = bindingsAt(workspace, 'top');
    expect(entries).toHaveLength(1);
    expect(entries[0]?.service_id).toBe(manifest.vpcProductionServiceId);
    expect(entries[0]?.remote).not.toBe(true);
  });

  it.each(CELLS)(
    '$workspace uses the remote development binding only in development and vpc tiers',
    ({ workspace }) => {
      for (const tier of ['development', 'vpc'] as const) {
        const entries = bindingsAt(workspace, tier);
        expect(entries).toHaveLength(1);
        expect(entries[0]?.service_id).toBe(manifest.vpcDevelopmentServiceId);
        expect(entries[0]?.remote).toBe(true);
      }
      for (const tier of ['local', 'test'] as const)
        expect(bindingsAt(workspace, tier)).toHaveLength(0);
    },
  );

  it.each(CELLS)('$workspace has no env.production block', ({ workspace }) => {
    const { config } = readWranglerConfig(join(workspace, 'wrangler.jsonc'));
    expect(Object.keys(config?.env ?? {})).not.toContain('production');
  });

  it.each(CELLS)('$workspace gates its local Rails overlay explicitly', ({ workspace }) => {
    const source = read(`${workspace}/src/lib/rails-client.ts`);
    const pkg = JSON.parse(read(`${workspace}/package.json`)) as { scripts?: { dev?: string } };
    expect(source).toContain("readLocalFlag('EDGE_LOCAL_NODE_RUNTIME') === '1'");
    expect(source).toContain("readLocalFlag('EDGE_LOCAL_RAILS_ENABLED') === '1'");
    expect(pkg.scripts?.dev).toMatch(/^EDGE_LOCAL_NODE_RUNTIME=1 /u);
  });
});
