/** Repository invariants for ADR 022 rate-limit namespace allocation. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ENV_PREFIX,
  JUMP,
  RATE_LIMITER_BUDGET,
  REGION,
  RETIRED_NAMESPACE_IDS,
  developmentPortFromDevScript,
  expectedDevelopmentPort,
  isPositiveIntegerString,
  parseWorkspace,
  rateLimiterNamespace,
  regionForSurface,
  regionSuffixOf,
} from '../tools/lib/rate-limit-namespaces.mjs';
import { loadManifest, parseJsonc, repoRoot } from '../tools/lib/wrangler-config.mjs';

const opsDoc = 'docs/operations/rate-limit-namespace-allocation.md';
const PRODUCTION_RATE_LIMITERS = {
  'com/docs': '510600',
  'com/help': '510800',
  'com/info': '510300',
  'com/news': '510700',
  'org/docs': '530600',
  'org/help': '530800',
  'org/info': '530300',
  'org/news': '530700',
  'app/docs': '540600',
  'app/help': '540800',
  'app/info': '540300',
  'app/news': '540700',
} as const;

type WranglerConfig = {
  ratelimits?: Array<{
    name?: string;
    namespace_id?: string;
    simple?: { limit?: number; period?: number };
  }>;
  env?: Record<
    string,
    {
      ratelimits?: Array<{
        name?: string;
        namespace_id?: string;
        simple?: { limit?: number; period?: number };
      }>;
    }
  >;
};

function deploymentUnits(): string[] {
  return (loadManifest() as { railsBackedVpcVite: string[] }).railsBackedVpcVite;
}

function readUnitWrangler(workspace: string): WranglerConfig {
  return parseJsonc(
    readFileSync(join(repoRoot, workspace, 'wrangler.jsonc'), 'utf8'),
  ) as WranglerConfig;
}

function allLimits(workspace: string, config: WranglerConfig) {
  const rows: { environment: string; entry: NonNullable<WranglerConfig['ratelimits']>[number] }[] =
    [];
  for (const entry of config.ratelimits ?? []) rows.push({ environment: 'production', entry });
  for (const [environment, block] of Object.entries(config.env ?? {})) {
    for (const entry of block.ratelimits ?? []) rows.push({ environment, entry });
  }
  return rows.map((row) => ({ workspace, ...row }));
}

describe('Press rate-limit namespace allocation', () => {
  const units = deploymentUnits();

  it('keeps the normative operations document and Jump reservation', () => {
    expect(existsSync(join(repoRoot, opsDoc))).toBe(true);
    const text = readFileSync(join(repoRoot, opsDoc), 'utf8');
    expect(text).toContain(JUMP.productionNamespaceId);
    expect(text).toContain('RATE_LIMITER');
    expect(text).not.toContain('AUTH_RATE_LIMITER');
  });

  it('derives each production namespace from the existing development port', () => {
    for (const [workspace, id] of Object.entries(PRODUCTION_RATE_LIMITERS)) {
      const { brand, surface } = parseWorkspace(workspace);
      const port = expectedDevelopmentPort(brand, surface);
      const region = regionForSurface(surface);
      expect(rateLimiterNamespace({ env: 'production', port, region })).toBe(id);
    }
  });

  it('keeps all Press and Jump production namespaces unique', () => {
    const byNamespace = new Map<string, string>([[JUMP.productionNamespaceId, JUMP.repo]]);
    for (const id of RETIRED_NAMESPACE_IDS) byNamespace.set(id, `retired ${id}`);

    expect([...units].sort()).toEqual(Object.keys(PRODUCTION_RATE_LIMITERS).sort());
    for (const workspace of units) {
      const config = readUnitWrangler(workspace);
      const { brand, surface } = parseWorkspace(workspace);
      const pkg = JSON.parse(readFileSync(join(repoRoot, workspace, 'package.json'), 'utf8')) as {
        scripts?: { dev?: string };
      };
      const port = developmentPortFromDevScript(pkg.scripts?.dev);
      expect(port, `${workspace} scripts.dev --port`).toBe(expectedDevelopmentPort(brand, surface));
      expect(regionForSurface(surface)).toBe(REGION.GLOBAL);

      for (const { environment, entry } of allLimits(workspace, config)) {
        const id = entry.namespace_id ?? '';
        expect(entry.name, `${workspace} ${environment}`).toBe('RATE_LIMITER');
        expect(entry.simple).toEqual(RATE_LIMITER_BUDGET);
        expect(isPositiveIntegerString(id), `${workspace} ${environment}`).toBe(true);
        expect(ENV_PREFIX[environment as keyof typeof ENV_PREFIX]).toBeDefined();
        expect(id).toBe(rateLimiterNamespace({ env: environment, port, region: REGION.GLOBAL }));
        expect(regionSuffixOf(id)).toBe(REGION.GLOBAL);

        const previous = byNamespace.get(id);
        expect(
          previous,
          `${workspace} ${environment} ${id} collides with ${previous}`,
        ).toBeUndefined();
        byNamespace.set(id, `${workspace} ${environment}`);
      }
    }
  });
});
