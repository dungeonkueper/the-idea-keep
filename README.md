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

## Project direction

- [Vision](VISION.md) — purpose, principles, and the experience The Idea Keep aims to create.
- [Architecture](ARCHITECTURE.md) — the current technical direction and its trade-offs.

## Current state

The first browseable version includes a homepage, a content detail page, metadata validation, and automatic GitHub Pages deployment. Its first published seed, [The Chicken-Egg Problem](content/ideas/the-chicken-egg-problem.md), records the platform's own starting point.
