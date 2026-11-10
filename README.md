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
chamber: 7
summary: A short description for listings and page metadata.
date: 2026-09-20
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: published
```

The build validates this metadata and derives the public URL from `kind` and `slug`. Only entries with `publicationStatus: published` are generated and listed. `chamber` is the entry's permanent number across all kinds: take the highest existing number plus one, drafts included, and never change or reuse it. Valid numbers run from 1 to 3999.

Each published entry produces HTML at `/<section>/<slug>/` and layout-free
Markdown at `/<section>/<slug>.md` from the same source. The generated `llms.txt`
at the site root links to these Markdown representations; article pages link to
their alternate as well. On the current project host the map is at
`/the-idea-keep/llms.txt`. Drafts and archived entries appear in neither format nor
the map. Keep lore explicitly headed or inside a semantic `aside`; it is retained
in both formats. Use absolute canonical URLs for references, since the two
representations have different relative URL bases. See
[Architecture](ARCHITECTURE.md#multiple-representations-and-discovery) for trade-offs.

Supported content kinds are `idea`, `experiment`, `learning`, `project`, and `artifact`. On the homepage, published ideas appear in **Wing A — The Hatchery** and published experiments in **Wing B — The Laboratory**; a wing stays hidden until it has a published entry. Other kinds get their own URLs and Markdown alternates but no homepage wing yet. The maturity values are documented in [ARCHITECTURE.md](ARCHITECTURE.md).

### Tidings from the Surface

Tidings are short reports on events outside the Keep, security incidents first.
Each one sets curated facts next to the author's own reading of them. They form
their own wing outside the chambers. They take no `chamber`, `kind`, or `maturity`,
and live in `content/tidings/`:

```yaml
wing: tidings
title: A useful title
slug: 2026-11-short-topic
summary: A short description for listings and page metadata.
first: 2026-11-09
updated: 2026-11-23
tags: [security]
publicationStatus: draft
```

The slug is `<YYYY-MM>-<short-topic>`, using the month of `first`, the day the
event first seriously occupied the author. Title and slug never change. Published
tidings get HTML at `/tidings/<slug>/`, Markdown at `/tidings/<slug>.md` and an
`llms.txt` entry. On the homepage they appear in **Tidings from the Surface**,
newest `updated` first; the section stays hidden until one is published.

The body starts with an optional one- or two-line lore line, then one block per
revision, oldest first. The title comes from frontmatter, so the body has no `#`
heading:

```markdown
_An optional lore line in raven-post mood._

## 2026-11-09
### Tidings
What happened, briefly and soberly; linked sources; contradictions and open
questions stated descriptively ("vendor confirms X, researchers report Y");
an "as of" date.
### A View from Below
Interpretation, opinion and learnings. Can be short, never omitted. Link any
egg it sparks.

## 2026-11-23 – Later tidings
### Tidings
...
### A View from Below
...
```

The build fails unless every revision has a non-empty **Tidings** part followed
by a non-empty **A View from Below** part, the first block is dated `first`,
the last is dated `updated`, and dates strictly increase. Editorial rules the
build cannot check:

- **Revisions are append-only.** New facts go into a new dated block. Earlier
  text is not silently corrected or deleted; a changed view stays part of the
  record. Only typos and broken links are fixed in place.
- **Curation is the evaluation.** Unusable sources are left out entirely. Sources
  get no reliability ratings. Doubts are shown only through concrete observations
  such as contradictions, retractions or missing confirmation.
- Paraphrase; quote sparingly. Name affected organizations factually.
- No cadence: a tiding exists only when an event has seriously occupied the
  author and there is something of their own to say.
- Tidings are reviewed per pull request and set to `published` only on explicit
  request.

The wing is represented in the Hatchery by the egg in chamber 8.

## Analytics

Cloudflare Web Analytics is optional. Set `CLOUDFLARE_WEB_ANALYTICS_TOKEN` locally or add it as a GitHub Actions repository variable to enable the consent controls. The Cloudflare beacon loads only after consent. Without the variable, the build emits neither consent controls nor an analytics script reference.

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
5. Open the deployed homepage in a fresh browser profile. Before choosing, and
   after declining, verify that no requests go to Cloudflare. Allow analytics:
   exactly one `beacon.min.js` script should then appear in the live DOM with the
   expected token. In browser developer tools, check the request to
   `https://cloudflareinsights.com/cdn-cgi/rum` succeeds; navigating away or
   hiding the tab can trigger reporting. Then check the Cloudflare dashboard
   after a few minutes, filtering paths under `/the-idea-keep/`.
6. Navigate to an Egg to verify that the saved choice is respected. Use
   **Analytics preferences** in the footer to withdraw permission. The page
   reloads without the beacon; already sent or in-flight reports cannot be recalled.

The local consent controller stores a versioned choice for 180 days in
`localStorage`, namespaced to this site. Missing, expired, or malformed choices
never enable analytics. Storage failure limits a new choice to the current page.
Withdrawal uses an `#analytics-disabled` reload marker so the reloaded page stays
off even if saving the rejection fails. JavaScript disabled means analytics off.
This implements the consent gate; the site's full privacy notice and provider
arrangements still need separate completion. The Cloudflare policy link in the
panel is not a substitute for the operator's privacy notice.

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
