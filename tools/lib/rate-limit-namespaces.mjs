// Account-wide RATE_LIMITER namespace allocation for Press (ADR 022).
// Wrangler files own each binding; this module derives and checks the existing ids.

export const REGION = { GLOBAL: '00' };

/** First two digits of the existing development-port allocation. */
export const TLD_CODE = { com: '51', org: '53', app: '54' };

/** Last two digits of the existing Press development-port allocation. */
export const SURFACE_CODE = { info: '03', docs: '06', news: '07', help: '08' };

export const ENV_PREFIX = {
  production: '',
  development: '2',
  test: '3',
  vpc: '4',
  local: '5',
};

export const RATE_LIMITER_BUDGET = { limit: 2000, period: 60 };
export const JUMP = {
  repo: 'umaxica-apps-edge-jump',
  productionNamespaceId: '520900',
};

/** Historical account-wide ids. Retired; must not be reused as active allocations. */
export const RETIRED_NAMESPACE_IDS = new Set(['999', '1006']);

export const POSITIVE_INTEGER_STRING = /^[1-9][0-9]*$/u;

export function parseWorkspace(workspace) {
  const [brand, surface] = workspace.split('/');
  return { brand, surface };
}

export function regionForSurface(surface) {
  return Object.hasOwn(SURFACE_CODE, surface) ? REGION.GLOBAL : null;
}

export function developmentPortFromDevScript(script) {
  const match = /--port\s+(\d{4})\b/u.exec(script ?? '');
  return match ? match[1] : null;
}

export function expectedDevelopmentPort(brand, surface) {
  const tld = TLD_CODE[brand];
  const code = SURFACE_CODE[surface];
  if (!tld || !code) return null;
  return `${tld}${code}`;
}

export function rateLimiterNamespace({ env, port, region }) {
  const prefix = ENV_PREFIX[env];
  if (prefix === undefined) throw new Error(`unknown rate-limit environment ${env}`);
  return `${prefix}${port}${region}`;
}

export function regionSuffixOf(namespaceId) {
  const id = String(namespaceId);
  return id.length >= 2 ? id.slice(-2) : '';
}

export function isPositiveIntegerString(namespaceId) {
  return POSITIVE_INTEGER_STRING.test(String(namespaceId));
}
