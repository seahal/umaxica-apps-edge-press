# Press development Tunnel

This repository owns the local Cloudflare Tunnel connector in `compose.yaml`. It is opt-in: `scripts/dev-start` starts the workspace container, and `scripts/dev-start --tunnel` also starts the connector. The connector joins the repository's `edge-tunnel` network and routes browser traffic to the running Press development service.

The local connector is separate from the outbound Workers VPC path to Rails. It does not supply a Workers VPC binding, and it does not change any production route. `vp dev` and the VPC tiers select their runtime and Rails transport from the unit's own Wrangler/Vite configuration.

The token is read from the local, ignored `.env` file as `CLOUDFLARED_TOKEN`. Do not place its value in tracked files, command output, or evidence. Compose uses one token variable and has no fallback chain. The connector is not started by a bare `podman compose up`; it is started only when explicitly named.

Useful local checks are `scripts/check-tunnel`, `scripts/check-local`, and `scripts/check-rails`. They validate distinct paths and do not alter Cloudflare configuration. For the Worker-to-Rails network, see [Cloudflare development network](../development/cloudflare-development-network.md).
