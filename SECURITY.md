# Security

The Idea Keep is a static Deno and Lume site. Dependency resolution and the
build environment are its main supply-chain boundary. When Cloudflare Web
Analytics is configured and a visitor consents, the site loads third-party
JavaScript in visitors' browsers from `static.cloudflareinsights.com`. This
optional, remotely maintained beacon is outside the Deno lockfile and build
sandbox. Its site token is public configuration, not an API credential. Remove
the token and redeploy to stop including the beacon.

## Dependency update ritual

Dependency changes must be made in a pull request. Keep direct dependencies on
exact versions. Wait at least three days before adopting a new direct HTTPS
release; the configured minimum dependency age applies the same delay to JSR and
npm resolution.

1. Check what is outdated with `deno outdated`.
2. Change only the intended exact version in `deno.json`.
3. Refresh the lockfile explicitly with `deno install --frozen=false`.
4. Inspect `git diff -- deno.json deno.lock`. Unexpected packages, registries,
   URLs, or large graph changes require investigation.
5. Use `deno why <package-or-specifier>` to explain every unfamiliar transitive
   dependency.
6. Run `deno audit`, followed by `deno task audit` and `deno task check`.
7. Merge only after the required Verify check succeeds.

Do not approve npm lifecycle scripts. Do not delete and recreate `deno.lock` for
a routine update: it records the exact resolved graph and integrity hashes. If
complete regeneration is unavoidable because the lockfile is damaged, preserve
the old file, regenerate through `deno install --frozen=false`, and review the
full old-to-new diff before committing it.

GitHub Actions dependencies are updated separately by Dependabot. Their `uses:`
references must remain pinned to full commit SHAs, with the readable release
name in a trailing comment.

## Local verification

### Isolated payment experiment

`experiments/feed-the-imps/` has its own pinned imports, three-day dependency
age rule, and lockfile. Run its `deno task bootstrap`, `deno task check`,
`deno task bundle`, and `deno audit --frozen-lockfile` independently of the
site. Do not approve lifecycle scripts. The MCP SDK peer is required to bundle
mppx's HTTP implementation; no MCP endpoint, Stripe method, or production
payment method is enabled. Wrangler and its runtime/bundler packages are tooling
only.

Worker secrets and local `.dev.vars` are excluded from Git and the entire
experiment directory is excluded from site output. Store only replay claims in
the Durable Object, never credentials or keys. Do not log raw SDK exceptions,
headers, signed transactions, or private keys. The test client creates its own
ephemeral faucet wallet; it never reads a production wallet. Its explicit
`--pay-testnet` switch authorizes one fixed Testnet payment. Deploying the
Worker is separate from building or deploying Pages.

### Website

Populate Deno's dependency cache strictly from the committed lockfile, then run
the checks and build without further dependency downloads:

```sh
deno task bootstrap
deno task check
deno task audit
```

The build permission set may read this repository, write only to `_site/`, and
read only the Cloudflare analytics variable. It cannot access the network, spawn
subprocesses, or load native code. The development server adds access to local
listening addresses only.
