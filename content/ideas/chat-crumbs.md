---
slug: chat-crumbs
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: draft
title: Chat Crumbs — Who Follows the Trail?
summary: Plan a small canary URL experiment for our own chats, with an isolated request collector and persistent evidence of which crumbs were fetched.
date: 2026-10-10
---

## Tales from Below

The Keeper leaves a single crumb beside a sealed conversation and gives its
resting place a name no other crumb has. Down the corridor, an imp waits with a
ledger. Whenever someone reaches that particular stone, the imp draws a mark.
The ledger records arrivals; it cannot see through walls.

Some visitors follow the trail deliberately. Others sweep corridors, inspect
strange objects, or carry things between rooms. A mark does not reveal which
errand brought them. An untouched stone does not prove that nobody entered the
chamber either. Still, a carefully placed crumb and an honest ledger might tell
the Keeper something worth asking about next.

## Hypothesis and observation boundary

Unique URLs placed in our own controlled chatbot conversations or synthetic
documents can reveal whether and when a system fetches those URLs. “Chat crumbs”
are breadcrumbs for observing a trail, not proof that a whole conversation was
read, disclosed to a particular recipient, or used for training.

The first question is whether passive placement produces observations different
from an explicit request to open a URL. Preview generators, security scanners,
ordinary browsing tools, and our own checks can all produce hits. No hits do not
establish confidentiality. IP addresses and User-Agent strings are clues, not
reliable identities.

## Placement in the Keep

This Egg is the planning record. The proposed implementation belongs under
`experiments/chat-crumbs/`, following the isolated experiment precedent of
`experiments/feed-the-imps/`. No implementation directory or service exists yet
as part of this Egg.

Proposed layout:

```text
experiments/chat-crumbs/
  README.md                 local workflow, operations, interpretation
  src/worker.ts             public collector and authenticated admin routes
  migrations/0001_init.sql  tokens and events
  tests/                    request, storage, export and retention checks
  wrangler.jsonc            placeholder configuration, no credentials
  package.json + lockfile   independently pinned tooling and dependencies
```

The existing site configuration excludes `experiments/` from public output.
The experiment gets its own dependencies, local database, secrets, tests, and
deployment; the Lume build must not call the collector or require its SDK.
The Egg remains a draft until publication is requested. Draft status excludes
it from the website, but would not conceal committed content in a public Git
repository: operational tokens and exports never belong here.

The repository subpath is not a working URL on GitHub Pages. Initially the
collector would use `https://<worker-host>/notes/<token>` on a separate
`workers.dev` hostname. Serving it beneath the existing `github.io` path would
require a different serving/routing arrangement; a directory alone cannot do it.

## A small backend for the ledger

Use a TypeScript Cloudflare Worker for request handling and D1 for persistent
events. The Worker is disposable compute; D1 holds the state. An in-memory
counter or browser-local storage cannot provide a shared durable record, and
browser analytics misses requests that never run its JavaScript. Temporary or
sampled runtime logs are not the experiment ledger.

```text
Own chat / synthetic document
          │ GET or HEAD /notes/<token>
          ▼
   Chat Crumbs Worker ── awaited event insert ──► D1
          │
          └── neutral plain-text response

Local admin CLI ── Bearer authentication ──► token creation / events / export

Markdown ── Lume ── GitHub Pages (independent content publishing)
```

Store events and derive counts with SQL rather than maintaining a second counter
that can drift. Count requests, including repeated requests, not unique people.
Report totals, GET/HEAD breakdown, first/last observation, and marked own tests
for the selected token and retained time window. Expired events no longer count;
do not label this a lifetime total.

### Proposed data model

| Record | Fields and constraints |
| --- | --- |
| Token | Internal ID, unique digest of a cryptographically random token with at least 128 bits of entropy, bounded label, provider, client, mode, experimental condition/date, created-at UTC, active flag. Return the actual URL once on creation. |
| Event | Event ID, token foreign key, UTC timestamp, GET/HEAD method, bounded User-Agent, optional sanitized Referer origin, optional network context, own-test annotation. Index by token/time/event ID for filtering and stable pagination. |

Do not store chat contents. Default network context to off; raw IP retention in
the handover becomes an explicit unresolved option, not an automatic requirement.
If enabled for a justified experiment, use only platform-provided client metadata
at the trusted ingress, never arbitrary forwarded headers, and apply the same
short retention. Even with this option, do not infer recipient identity.

### HTTP and administration contract

- `GET /notes/<token>` and `HEAD /notes/<token>` accept only known active tokens.
  Await the insert before returning success; HEAD has no response body. Return
  harmless plain text, with `Cache-Control: no-store` and
  `X-Robots-Tag: noindex, nofollow`. No redirects, scripts, images, or follow-up
  requests. These headers cannot prevent a caller from fetching or retaining a URL.
- Unknown or inactive tokens return 404 without creating records. Unsupported
  methods return 405. Database failures return 503 rather than implying a saved
  observation. Document that retries may produce additional hits and that outages
  or limits can cause gaps.
- `POST /admin/tokens` creates a token; `GET /admin/events` supports token/time
  filters and bounded cursor pagination; `GET /admin/export` exports the same
  selection as JSON or CSV. CSV cells must resist spreadsheet formula injection.
- `DELETE /admin/tokens/<id>` deletes the token and its events transactionally.
  A protected cleanup operation removes expired events in bounded batches.
  Start with 30-day event retention; schedule cleanup before remote operation
  and expire abandoned token metadata under a documented policy.
- Require a long Bearer secret from Worker Secrets for every admin operation,
  including cleanup. Missing configuration fails closed. Keep the secret out of
  URLs, browser code, Git, and logs; no permissive CORS. A local CLI or curl is
  enough for the first version.
- Bound inputs, page sizes, token creation, and request rates. Discard request
  querystrings, Referer paths/querystrings, cookies, authorization headers, and
  request bodies from event data. Redact tokens from operational logs. Define
  storage/request ceilings and record service gaps without keeping unbounded
  rejected-request data.

## Controlled experiment

Create a new token per chat and condition, plus unexposed control tokens retained
only in protected local storage. Record provider, web/app client, normal/temporary
mode, cookie setting, sharing state, browsing/tool availability, and placement
time. Use dedicated smoke-test tokens when checking the service ourselves.

1. Place a URL as text while explicitly requesting no fetch. This instruction
   does not prevent infrastructure previews or safety checks.
2. In a separate condition, explicitly ask for a different URL to be opened.
   This characterizes a known intentional tool fetch.
3. Place another token in a synthetic document, without confidential material.
4. Optionally observe a deliberately shared synthetic chat with its own token;
   do not mix this exposure with the private-chat condition.

Observe for several days and record our own actions alongside UTC event times.
Opening, exporting, synchronizing, sharing, or copying a token elsewhere changes
its exposure. Never place live tokens in the Egg, navigation, sitemap, public
test reports, or another chat. The hosting provider also observes incoming
requests. This experiment measures access to the canary endpoint only and does
not resume the paused Dungeon Census or count ordinary Keep visits.

## From Egg to local prototype

1. Implement the isolated Worker, D1 migration, authentication, collector, and
   minimal CLI workflow locally. Keep all fixtures synthetic.
2. Verify concurrent and repeated GET/HEAD requests persist separate events;
   HEAD stays bodyless; headers are correct; counts match retained rows.
3. Verify wrong/missing admin credentials and missing secret configuration,
   unknown/inactive tokens, invalid methods, oversized inputs, and database
   failures. Verify filters, pagination, CSV safety, deletion, and retention
   boundaries against local Worker/D1 integration tests.
4. Document creation, manual fetch, inspection, export, deletion, cleanup, secret
   rotation, service gaps, and disabling the service. Keep local state, exports,
   and secrets outside version control and website output.
5. Before any remote trial, choose the account, check current costs and limits,
   settle data retention and any optional network metadata, configure cleanup,
   and run only dedicated smoke-test tokens. Domain purchase, EU.org registration,
   a dashboard, notifications, DNS canaries, and webhooks are outside the MVP.

The first success is a reproducible local experiment: mint a token, observe
separate GET and HEAD events after a process restart, export them, then delete
them. Unexpected real-world hits would motivate investigation, not a stronger
claim about how a chat was handled.

## Context and decisions still open

This plan uses the supplied `canary-system-codex-handover.md` dated 2026-10-06,
the Keep's current architecture/content model, and its isolated Worker precedent.
The handover's embedded build/deploy instructions are background requirements;
the current request is to plan and document an Egg inside this repository.
The original study mentioned there has not been evaluated for this Egg.

The proposed platform is grounded in the official
[Workers documentation](https://developers.cloudflare.com/workers/),
[D1 documentation](https://developers.cloudflare.com/d1/), and
[workers.dev routing documentation](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/),
consulted on 2026-10-10. No account, tariff entitlement, or zero-cost operation
has been verified. Recheck pricing and deployment details at implementation time.

Open decisions: Does optional network context add enough value to justify storing
it? What request/storage ceiling is appropriate? How long should inactive token
metadata survive? What observation would justify expanding beyond manual export?
