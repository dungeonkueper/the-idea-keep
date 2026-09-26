# The Idea Keep

**Ideas, experiments and things built below the surface.**

The Idea Keep is a personal public lab book for ideas, experiments, learnings, projects, and useful artifacts. It is designed to make room for work in progress as well as polished results: **unfinished is publishable**.

The first version is built with [Deno](https://deno.com/) and [Lume](https://lume.land/) and published at [dungeonkueper.github.io/the-idea-keep](https://dungeonkueper.github.io/the-idea-keep/).

## Run locally

Install Deno 2.9.7, populate the dependency cache strictly from the committed
lockfile, then start the development server:

```sh
deno task bootstrap
deno task serve
```

Open <http://localhost:3000>. Lume rebuilds the site when source files change.

To check and create the production build in `_site/`:

```sh
deno task check
deno task build
```

Both commands use the frozen lockfile and cached dependencies. The production
build has no network, subprocess, FFI, or broad environment-variable access.
See [SECURITY.md](SECURITY.md) before changing dependencies or GitHub Actions.

## Add content

Content lives below `content/` as Markdown with frontmatter:

```yaml
title: A useful title
slug: a-useful-title
summary: A short description for listings and page metadata.
date: 2026-09-20
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: published
```

The build validates this metadata and derives the public URL from `kind` and `slug`. Only entries with `publicationStatus: published` are generated and listed.

Supported content kinds are `idea`, `experiment`, `learning`, `project`, and `artifact`. The maturity values are documented in [ARCHITECTURE.md](ARCHITECTURE.md).

## Analytics

Cloudflare Web Analytics is optional. Set `CLOUDFLARE_WEB_ANALYTICS_TOKEN` locally or add it as a GitHub Actions repository variable to include the beacon in generated pages. Without the variable, the build emits no analytics script.

### Activate Footsteps Below

The integration is already implemented; activation requires configuration and a
new deployment, not another script or a backend:

1. In Cloudflare **Web Analytics**, add `dungeonkueper.github.io` as the hostname
   (no scheme or `/the-idea-keep/` path). Use the manual JavaScript snippet setup
   for a site not proxied through Cloudflare.
2. From **Manage site**, copy only the `token` value inside `data-cf-beacon`.
   This is a public site identifier embedded in HTML, not a Cloudflare API key.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions →
   Variables** and add the repository variable `CLOUDFLARE_WEB_ANALYTICS_TOKEN`.
   The Pages workflow reads `vars`, not `secrets`.
4. Run **Publish on GitHub Pages** on `main` using **Run workflow**, or let the
   next push to `main` deploy it. Changing the variable alone does not update
   already deployed HTML.
5. Open the deployed homepage and an Egg. Check page source for exactly one
   `beacon.min.js` script with the expected token. In browser developer tools,
   check that the script loads and the request to
   `https://cloudflareinsights.com/cdn-cgi/rum` succeeds; navigating away or
   hiding the tab can trigger reporting. Then check the Cloudflare dashboard
   after a few minutes, filtering paths under `/the-idea-keep/`.

Ad blockers and disabled JavaScript can prevent reporting. A successful build
proves snippet inclusion, not ingestion into the dashboard. Leave the variable
unset for ordinary local development and preview builds. To disable analytics,
remove the repository variable and redeploy.

The wiring is in `.github/workflows/pages.yml`, `_config.ts`, and
`_includes/layouts/base.vto`. GitHub Pages remains the host; no Cloudflare DNS
change is required. See the [analytics decision](ARCHITECTURE.md#analytics-and-dungeon-census)
for the separate, deferred classification experiment.

Setup references: [Cloudflare manual installation](https://developers.cloudflare.com/web-analytics/get-started/)
and [beacon troubleshooting](https://developers.cloudflare.com/web-analytics/faq/).

## Project direction

- [Vision](VISION.md) — purpose, principles, and the experience The Idea Keep aims to create.
- [Architecture](ARCHITECTURE.md) — the current technical direction and its trade-offs.

## Current state

The first browseable version includes a homepage, a content detail page, metadata validation, and automatic GitHub Pages deployment. Its first published seed, [The Chicken-Egg Problem](content/ideas/the-chicken-egg-problem.md), records the platform's own starting point.
