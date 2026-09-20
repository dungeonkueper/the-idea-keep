# Security

The Idea Keep is a static Deno and Lume site. Third-party code runs during the
build, not in visitors' browsers. The project therefore treats dependency
resolution and the build environment as its main supply-chain boundary.

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

Populate Deno's dependency cache strictly from the committed lockfile, then run
the checks and build without further dependency downloads:

```sh
deno ci
deno task check
deno task audit
```

The build permission set may read this repository, write only to `_site/`, and
read only the Cloudflare analytics variable. It cannot access the network, spawn
subprocesses, or load native code. The development server adds access to local
listening addresses only.
