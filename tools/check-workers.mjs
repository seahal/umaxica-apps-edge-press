#!/usr/bin/env node
// Validates the twelve Press Workers' Wrangler configuration and package scripts.
// Run from the repository root: pnpm run check:workers.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  ENV_PREFIX,
  JUMP,
  RATE_LIMITER_BUDGET,
  RETIRED_NAMESPACE_IDS,
  developmentPortFromDevScript,
  expectedDevelopmentPort,
  isPositiveIntegerString,
  parseWorkspace,
  rateLimiterNamespace,
  regionForSurface,
} from './lib/rate-limit-namespaces.mjs';
import { loadManifest, readWranglerConfig, repoRoot as root } from './lib/wrangler-config.mjs';

const manifest = loadManifest();
const units = manifest.railsBackedVpcVite;
const expectedUnits = ['app', 'com', 'org'].flatMap((brand) =>
  ['docs', 'help', 'info', 'news'].map((surface) => `${brand}/${surface}`),
);
const failures = [];
const fail = (workspace, message) => failures.push(`${workspace}: ${message}`);

if (
  !Array.isArray(units) ||
  JSON.stringify([...units].sort((a, b) => a.localeCompare(b))) !==
    JSON.stringify([...expectedUnits].sort((a, b) => a.localeCompare(b)))
) {
  fail('workers-manifest', 'must list exactly the twelve Press content Workers');
}

const trackedFileList =
  process.env['EDGE_TRACKED_FILES'] ??
  execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' });
const trackedFiles = new Set(trackedFileList.split('\n').filter(Boolean));
const NON_INHERITABLE = [
  'vars',
  'kv_namespaces',
  'services',
  'images',
  'version_metadata',
  'ratelimits',
  'durable_objects',
  'r2_buckets',
  'd1_databases',
  'queues',
];
const OBSERVABILITY_POLICY = {
  enabled: true,
  head_sampling_rate: 1,
  redact_query_string: true,
  issues: { enabled: true },
  logs: { enabled: true, head_sampling_rate: 0.1, persist: true, invocation_logs: false },
  traces: { enabled: true, head_sampling_rate: 0.02, persist: true },
};
const canonicalJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

function loadWrangler(workspace) {
  const { config, error } = readWranglerConfig(join(workspace, 'wrangler.jsonc'));
  if (error) {
    fail(workspace, error.slice(`${workspace}/`.length));
    return null;
  }
  return config;
}

function checkEnvironments(workspace, config) {
  const required = ['local', 'development', 'vpc', 'test'];
  for (const name of required) {
    if (!config.env?.[name]) fail(workspace, `env.${name} is missing`);
  }
  if (config.env?.production)
    fail(workspace, 'env.production must not exist; the top level is production');
  if (config.vars?.EDGE_ENV !== 'production')
    fail(workspace, 'top-level vars must set EDGE_ENV to production');

  for (const [label, env] of [['top level', config], ...Object.entries(config.env ?? {})]) {
    if (env.vars?.CLOUDFLARE_ENV !== undefined) {
      fail(workspace, `${label} vars must not bind CLOUDFLARE_ENV; use EDGE_ENV`);
    }
  }
  for (const [name, env] of Object.entries(config.env ?? {})) {
    const missing = NON_INHERITABLE.filter(
      (key) => config[key] !== undefined && env[key] === undefined,
    );
    if (missing.length)
      fail(workspace, `env.${name} is missing non-inheritable keys: ${missing.join(', ')}`);
  }
}

function vpcBindings(config, path) {
  const env = path === 'top' ? config : config.env?.[path];
  return (env?.vpc_services ?? []).filter((entry) => entry.binding === manifest.vpcBinding);
}

function checkVpcPolicy(workspace, config) {
  for (const [path, serviceId, remote] of [
    ['top', manifest.vpcProductionServiceId, false],
    ['development', manifest.vpcDevelopmentServiceId, true],
    ['vpc', manifest.vpcDevelopmentServiceId, true],
  ]) {
    const entries = vpcBindings(config, path);
    if (entries.length !== 1) {
      fail(
        workspace,
        `${path} must declare ${manifest.vpcBinding} exactly once (found ${entries.length})`,
      );
      continue;
    }
    if (entries[0].service_id !== serviceId)
      fail(workspace, `${path} VPC service_id does not match the manifest`);
    if (Boolean(entries[0].remote) !== remote)
      fail(workspace, `${path} VPC remote flag is incorrect`);
  }
  for (const path of ['local', 'test']) {
    if (vpcBindings(config, path).length)
      fail(workspace, `env.${path} must not declare the Workers VPC binding`);
  }
}

function checkViteWorker(workspace, config) {
  if (config.vars?.NODE_ENV !== 'production')
    fail(workspace, 'top-level vars must set NODE_ENV to production');
  if (!config.compatibility_flags?.includes('nodejs_compat'))
    fail(workspace, 'compatibility_flags must include nodejs_compat');
  if (config.assets?.directory !== undefined)
    fail(workspace, 'assets.directory must be left to the Vite plugin output config');
  if (config.assets?.html_handling !== 'none' || config.assets?.not_found_handling !== 'none') {
    fail(workspace, 'assets.html_handling and assets.not_found_handling must both be "none"');
  }
  if (config.assets?.binding !== undefined) fail(workspace, 'assets binding must not be declared');
  if (config.images !== undefined) fail(workspace, 'images binding must not be declared');
  if ((config.services ?? []).some((entry) => entry.binding === 'WORKER_SELF_REFERENCE')) {
    fail(workspace, 'WORKER_SELF_REFERENCE is an OpenNext-only binding');
  }
  if (config.main?.includes('.open-next')) fail(workspace, 'main must not point into .open-next');
}

function checkPublicAssets(workspace) {
  const publicDir = join(root, workspace, 'public');
  if (!existsSync(publicDir)) {
    fail(workspace, 'public/ is missing');
    return;
  }
  for (const asset of ['_headers', 'service-worker.js']) {
    if (!existsSync(join(publicDir, asset))) fail(workspace, `public/${asset} is missing`);
  }
  for (const entry of readdirSync(publicDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name).slice(root.length).replace(/^\//u, '');
    if (!trackedFiles.has(path)) fail(workspace, `${path} is not tracked by git`);
  }
}

function checkRateLimits(workspace, config, byNamespace) {
  const { brand, surface } = parseWorkspace(workspace);
  const region = regionForSurface(surface);
  const pkg = JSON.parse(readFileSync(join(root, workspace, 'package.json'), 'utf8'));
  const port = developmentPortFromDevScript(pkg.scripts?.dev);
  const expectedPort = expectedDevelopmentPort(brand, surface);
  if (!port || port !== expectedPort) fail(workspace, `scripts.dev port must be ${expectedPort}`);
  if (!region) fail(workspace, `surface ${surface} has no Press rate-limit region`);

  const checkOne = (environment, entry) => {
    const id = String(entry.namespace_id ?? '');
    if (entry.name !== 'RATE_LIMITER') {
      fail(workspace, `${environment} declares an unsupported rate-limit binding`);
      return;
    }
    if (!isPositiveIntegerString(id))
      fail(workspace, `${environment} RATE_LIMITER namespace_id must be a positive integer string`);
    if (RETIRED_NAMESPACE_IDS.has(id))
      fail(workspace, `${environment} claims retired namespace_id ${id}`);
    if (canonicalJson(entry.simple) !== canonicalJson(RATE_LIMITER_BUDGET)) {
      fail(
        workspace,
        `${environment} RATE_LIMITER budget must remain ${RATE_LIMITER_BUDGET.limit}/${RATE_LIMITER_BUDGET.period}`,
      );
    }
    if (ENV_PREFIX[environment] === undefined) {
      fail(workspace, `${environment} has no Press rate-limit namespace prefix`);
      return;
    }
    const expected = rateLimiterNamespace({ env: environment, port, region });
    if (id !== expected)
      fail(workspace, `${environment} RATE_LIMITER namespace_id must be ${expected}`);
    const previous = byNamespace.get(id);
    if (previous) fail(workspace, `${environment} namespace_id collides with ${previous}`);
    else byNamespace.set(id, `${workspace} ${environment}`);
  };

  for (const entry of config.ratelimits ?? []) checkOne('production', entry);
  for (const [environment, env] of Object.entries(config.env ?? {})) {
    for (const entry of env.ratelimits ?? []) checkOne(environment, entry);
  }
}

function checkObservability(workspace, config) {
  if (canonicalJson(config.observability) !== canonicalJson(OBSERVABILITY_POLICY)) {
    fail(workspace, 'observability differs from the Press policy');
  }
  if (config.upload_source_maps !== true) fail(workspace, 'upload_source_maps must be true');
  for (const [name, env] of Object.entries(config.env ?? {})) {
    if (env.observability !== undefined || env.upload_source_maps !== undefined) {
      fail(workspace, `env.${name} must inherit observability and upload_source_maps`);
    }
  }
}

function checkCache(workspace, config) {
  if (config.cache?.enabled !== false)
    fail(workspace, 'cache.enabled must remain explicitly false');
  if (config.cache && Object.keys(config.cache).some((key) => key !== 'enabled')) {
    fail(workspace, 'cache must declare only enabled: false');
  }
  for (const [name, env] of Object.entries(config.env ?? {})) {
    if (env.cache !== undefined) fail(workspace, `env.${name} must inherit cache policy`);
  }
}

function checkDeploymentScripts(workspace) {
  const scripts =
    JSON.parse(readFileSync(join(root, workspace, 'package.json'), 'utf8')).scripts ?? {};
  for (const [name, body] of Object.entries(scripts)) {
    if (/--env\s+production/u.test(body)) fail(workspace, `${name} must not pass --env production`);
    for (const segment of body.split('&&')) {
      if (!/\b(?:vp\s+(?:dev|build|preview)|wrangler)\b/u.test(segment)) continue;
      if (/--env\s+\S+/u.test(segment) || /(?:^|\s)CLOUDFLARE_ENV=/u.test(segment)) continue;
      fail(
        workspace,
        `${name} must blank CLOUDFLARE_ENV or select an explicit Wrangler environment`,
      );
    }
  }
}

const byNamespace = new Map([[JUMP.productionNamespaceId, `${JUMP.repo} production`]]);
for (const id of RETIRED_NAMESPACE_IDS) byNamespace.set(id, `retired ${id}`);

for (const workspace of units) {
  const config = loadWrangler(workspace);
  if (!config) continue;
  checkEnvironments(workspace, config);
  checkVpcPolicy(workspace, config);
  checkViteWorker(workspace, config);
  checkPublicAssets(workspace);
  checkRateLimits(workspace, config, byNamespace);
  checkObservability(workspace, config);
  checkCache(workspace, config);
  checkDeploymentScripts(workspace);
}

if (failures.length) {
  process.stderr.write(
    `check-workers: FAIL\n${failures.map((message) => `  - ${message}\n`).join('')}`,
  );
  process.exit(1);
}
process.stdout.write(`check-workers: OK (${units.length} Press Workers validated)\n`);
