# Architecture

> **Status: First slice implemented.** The static Deno/Lume foundation described here now powers the first browseable version. It remains a practical starting point rather than a permanent commitment.

## Goals

- Keep the first version low-cost and simple to operate.
- Make publishing from version-controlled Markdown straightforward.
- Treat the generated website as portable static output.
- Keep content concepts clear enough to support future search, relationships, or a database-backed implementation if needed.

## Implemented foundation

```text
Markdown content + frontmatter
              ↓
       Deno / Lume build
              ↓
       Static site output
              ↓
       GitHub Pages
              │
              └── Optional Cloudflare Web Analytics
```

- **Runtime and site generator:** Deno 2 with Lume 3, producing a static site from Markdown and frontmatter.
- **Content source:** Markdown files stored in the repository. Content remains reviewable and editable with ordinary tools.
- **Content boundary:** A small TypeScript module validates required metadata and derives public URLs before pages are rendered.
- **Hosting:** GitHub Actions builds the static output and deploys it to GitHub Pages. The build command and generated output remain independent of the hosting provider.
- **Analytics:** The shared layout includes Cloudflare Web Analytics only when a token is provided at build time. It does not require moving hosting or DNS to Cloudflare.
- **Application backend:** None is needed for the initial static site. Reconsider a server or database if requirements such as browser-based editing, accounts, or dynamic experiences become central.

## Content model

Keep three independent dimensions in content metadata:

| Dimension | Describes | Initial values |
| --- | --- | --- |
| `kind` | What the item is | `idea`, `experiment`, `learning`, `project`, `artifact` |
| `maturity` | How developed or supported it is | `seed`, `testing`, `working-theory`, `validated`, `discarded`, `dormant` |
| `publicationStatus` | Whether it is visible on the site | `draft`, `published`, `archived` |

This separation allows, for example, a discarded experiment to be published as a useful learning. The first content entry uses `kind: idea`, `maturity: seed`, and `publicationStatus: published`.

Only content marked `published` is currently rendered and listed. Draft preview, archived-content browsing, relationships, tags, and pagination can be introduced when the collection creates a concrete need for them.

Content may link to related items as the collection grows. For now, Markdown files are the source of truth; a database and ORM are not part of the initial implementation. If that changes, preserve a boundary between content parsing/storage and site rendering so a new storage adapter can be introduced without rewriting the entire site.

## Portability and trade-offs

The build should produce ordinary HTML, CSS, JavaScript, and assets in a static output directory. CI should invoke the project build and publish that output; host-specific workflow configuration should not contain the site's core build logic. This keeps a move from GitHub Pages to another static host largely a deployment and domain configuration change.

GitHub Pages is a convenient first host, while Cloudflare Analytics is an optional measurement tool. Neither choice should shape the content model or require the site to run on that provider.

## Analytics and Dungeon Census

**Decision (2026-09-26):** Use the existing optional Cloudflare Web Analytics
integration for Phase 1. Keep GitHub Pages hosting and portable static output.
No new runtime service, dependency, or analytics database is needed. Activation
is a public site token in the repository variable followed by a Pages deployment;
the [README](README.md#activate-footsteps-below) records setup and verification.
The integration's presence does not establish that production reporting is active.

Cloudflare owns ordinary visits/page views, popular routes, referrers, browser
information, and available Web Vitals. These are beacon observations, not a
complete count of HTTP requests or proof of human visitors. JavaScript execution,
blockers, and delivery failures affect coverage. Cloudflare Web Analytics is
distinct from Cloudflare's edge traffic and bot analytics.

### Phase 2: Grow, only after a concrete measurement question

A small Cloudflare Worker or equivalent HTTP endpoint can coexist with GitHub
Pages on a separate hostname. It can inspect headers of requests **to that
endpoint**, not the original requests served by GitHub Pages. A browser beacon
would still miss crawlers that do not execute it. Linking or advertising a census
endpoint does not make every crawler call it either.

Therefore a standalone endpoint is appropriate for a deliberately partial
classification experiment and our own cooperating automation, not a census of
all site traffic. Observing ordinary non-JavaScript crawler page requests would
require request logs from the serving layer or a proxy in the actual request
path. A future custom domain with an edge proxy could retain GitHub Pages as the
origin, but changes DNS, routing, trust, and operations. That is a separate
architecture decision; an endpoint alone cannot provide this visibility on the
current `github.io` URL.

Potential categories, always accompanied by a reason and uncertainty:

| Category | Interpretation |
| --- | --- |
| `IMP` | Our automation with a verified deliberate marker; a public browser token cannot authenticate it. |
| `BOT` | Recognizable crawler/agent signals; a User-Agent claim can be spoofed. |
| `HERO` / `HERO?` | Probably human only with justified supporting evidence; browser headers alone are insufficient. |
| `UNKNOWN` | Missing, ambiguous, or conflicting evidence, including browser-like traffic without stronger evidence. |

User-Agent and optional Client Hints are inputs, not identity. No invasive
fingerprinting, persistent visitor IDs, or raw IP/complete-header storage is
planned. Before implementation, define the observation boundary, classification
rules, short retention, allowed route values, request-size/rate limits, and
failure behavior. A browser caller would require explicit cross-origin handling;
CORS is not authentication or protection against forged submissions. The static
site must remain usable when the census is unavailable.

### Phase 3: Mature, only if observations prove useful

Aggregate counts by normalized route/Egg, category, and time bucket rather than
individual visitors. Strip query strings and fragments, bound route cardinality,
and avoid retaining raw headers. Choose storage and retention only when needed.
Any public **Dungeon Census / Footsteps Below** should disclose its partial
coverage and probabilistic labels. Its counts must not be presented as a
breakdown of Cloudflare visits: the two instruments observe different populations.

No census endpoint, classifier, storage, or public counter is implemented in
Phase 1. The idea is preserved as a [draft Egg](content/ideas/counting-footsteps-in-the-dungeon.md).

References: [Cloudflare Web Analytics setup](https://developers.cloudflare.com/web-analytics/get-started/),
[beacon limitations](https://developers.cloudflare.com/web-analytics/faq/), and
[standalone Worker routing](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).

## Revisit when

Reassess this direction if publishing becomes cumbersome, content volume calls for a different authoring workflow, or the site needs dynamic capabilities such as accounts, comments, or interactive server-backed features.
