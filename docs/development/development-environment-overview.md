# Edge development environment overview

The Edge development environment is a rootless Podman workspace. The container is an
independent security principal: it never receives the host HOME, private keys, CLI
credential stores, or Podman/Docker sockets.

It borrows one thing from the host, and only to reach GitHub: `GH_TOKEN` (for the `gh`
API) as standard, plus — only if the developer opts in through the optional
`compose.override.yaml` — an ssh-agent socket for Git over SSH and a read-only
`known_hosts`. No key material crosses any of them — see
[Git and GitHub access](git-and-github-access.md).

`compose.yaml` plus `compose.workspace.yaml` are a complete standard environment: a
fresh clone starts with no
local file created.

## Startup

Start the environment with `scripts/dev-start`; it also takes the optional Rails and Tunnel
flags:

```bash
scripts/dev-start
scripts/dev-start --rails
scripts/dev-start --tunnel
scripts/dev-start --rails --tunnel
```

The Tunnel modes require `CLOUDFLARED_TOKEN` in the gitignored root `.env`. It is a scoped
connector token for the Edge-specific Tunnel, not an API token, and must not match Global's token.
`--rails` joins an
existing rootless Podman network named by `EDGE_RAILS_NETWORK`; it never creates or
guesses one. `--tunnel` starts the Edge connector, which is defined in `compose.yaml`.
Credentials are obtained inside the running container through browser logins — see
[Credential and secret management](credential-and-secret-management.md).

Enter the interactive service with:

```bash
podman compose -f compose.yaml -f compose.workspace.yaml exec core bash -l
```

Node.js is pinned to 24.21.0 and pnpm to 12.11.2, both declared in
`package.json#devEngines` and matched by `Containerfile`. pnpm is installed from the
standalone script, not Corepack, which the image removes outright. Use `pnpm` directly in
scripts and documented commands; the `pn`/`pnpx`/`pnx` short commands that pnpm 11 installs
alongside it are on `PATH` too. Bun is not part of the environment.

The runtime/network architecture is documented in
[cloudflare-development-network.md](cloudflare-development-network.md). Security and
credential rules are in [container-security-policy.md](container-security-policy.md) and
[credential-and-secret-management.md](credential-and-secret-management.md); logging
Wrangler in is [wrangler-authentication.md](wrangler-authentication.md).
