# Cloudflare development network

The twelve Press units run TanStack Start in Cloudflare's workerd runtime through Vite+. Each cell uses the same local development tiers; the VPC binding is unavailable in a local simulator, so `env.vpc` and the development environment request remote bindings. The `local` tier uses the explicitly gated local Rails transport. No missing binding falls back to another environment.

## Rails paths

- **Local unit server:** `vp dev` uses the local tier and the cell's own `PRIVATE_RAILS_ORIGIN`. When the local Rails overlay is explicitly enabled, the client uses the local network path. Otherwise it fails closed.
- **Development VPC:** workerd uses the remote Workers VPC binding to reach the development VPC Service and its Rails tunnel.
- **VPC preview:** `dev:vpc` uses the same development VPC Service from local workerd. This tier requires an interactive Wrangler login; an API token is not accepted for a remote VPC binding.
- **Production:** the top-level Worker config uses the current bootstrap VPC Service. Its service id remains a separate field in `tools/workers-manifest.json` so an owner can change it at the production cutover without application changes.
- **Test:** `env.test` carries no VPC service, so a test cannot silently reach live Rails through that binding.

Each cell supplies its own host in `PRIVATE_RAILS_ORIGIN`; the Workers VPC service id selects the network path while the request host selects Rails dispatch. The config checker validates all twelve cells and each environment's binding policy.

## Local checks

- `scripts/check-local` requests `/health` on all twelve local cell ports.
- `scripts/check-rails` requests the Rails Health API through the local Rails network.
- `pnpm run check:workers` checks the configured VPC binding ids and tiers without making a remote Wrangler request.

The public content cells use read-only, server-side Rails GET requests. See [Public Information Surfaces](../public-information-surfaces.md), [ADR 005](../../adr/005-rails-edge-workers-vpc-connection.md), and [ADR 006](../../adr/006-development-workers-vpc-transport.md).
