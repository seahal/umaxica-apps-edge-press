# Security Policy

This repository contains twelve public content Workers for `umaxica.app`, `umaxica.com`, and `umaxica.org`. The Rails application is maintained separately and is outside this policy.

## Reporting

Use [GitHub private vulnerability reporting](https://github.com/seahal/umaxica-apps-edge-press/security/advisories/new). For hardening suggestions or questions, [open an issue](https://github.com/seahal/umaxica-apps-edge-press/issues). Issues are public; do not post an unfixed exploit or sensitive data there.

Include the unit or hostname involved, the commit SHA tested, the observed behavior, and the impact. Do not include tokens, cookies, secret values, or data belonging to others.

## Scope

In scope are the twelve units listed in `pnpm-workspace.yaml`, their public production hostnames under the three Press domains, and their local development configuration. Out of scope are Rails, Cloudflare's platform, other Edge repositories, test fixtures, and denial-of-service testing against production.

Research against your own data and accounts. Stop when impact is confirmed and report it through the private channel.

## Existing safeguards

Each unit owns its response-header policy, request logger, rate-limit binding, and Wrangler config. Browser cookie access is limited by [the cookie guidance](docs/development/browser-cookie-access.md). Secret and container handling is documented in [credential management](docs/development/credential-and-secret-management.md) and [container security](docs/development/container-security-policy.md). CI runs dependency audit and secret scanning.
