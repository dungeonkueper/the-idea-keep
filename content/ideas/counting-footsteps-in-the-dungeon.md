---
slug: counting-footsteps-in-the-dungeon
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: draft
title: Counting Footsteps in the Dungeon
summary: Explore modest ways to classify the Keep's visitors, then pause the Census until its measurement and privacy questions are settled.
date: 2026-09-26
---

> Not every footstep in the dungeon belongs to a hero.

The first footprint has appeared in the ledger: the Keeper's own visit.
Cloudflare Web Analytics is now integrated, deployed, and reporting, while the
Keep remains a static Deno/Lume site on GitHub Pages. That proves the technical
path works. It does not settle the privacy questions around operating it.

The more interesting experiment is whether a few modest signals can distinguish
our own Imps, recognizable bots, probable human visitors, and the unknown.
Before building that experiment, we need to decide which doorway we can actually
observe and whether the resulting knowledge is worth the machinery.

## Current hypothesis

Ordinary traffic measurement can remain a commodity service. A separate,
explicitly partial Dungeon Census might add useful context without becoming a
generic analytics backend, provided its uncertainty remains visible and it
avoids invasive fingerprinting.

## Desired evolution

- **Hatch:** Cloudflare Web Analytics is technically active and its first visit
  has been observed. Privacy information and the basis for operating the beacon
  remain unresolved.
- **Grow:** Explore a small endpoint only when there is a concrete question that
  ordinary analytics cannot answer. Classify observations as `BOT`, `IMP`,
  `HERO?`, or `UNKNOWN`; browser-like headers alone do not establish humanity.
- **Mature:** If useful, aggregate by route/Egg and present a thematic Dungeon
  Census or Footsteps Below with its coverage limits clearly stated.

## Options for the Census

| Option | What it offers | What it leaves unresolved |
| --- | --- | --- |
| Existing Cloudflare Web Analytics | Ordinary page and visitor statistics with little infrastructure. | It currently has no custom events for our own category counters. |
| GitHub repository traffic | Repository visits and clones. | These are not visits to the published Pages website or a Census event store. |
| Separate Worker and Workers Analytics Engine | A small classifier plus managed event storage and SQL aggregation, without our own database. | Only clients that contact the Worker are observed; collection, classification, and operations still need design. |
| A proxy in the page-request path | Visibility into requests from crawlers that never execute a browser beacon. | A custom domain and routing changes would add responsibility; GitHub Pages could remain the origin. |

The counter is only half the problem. A separate Worker sees only requests sent
to it. It cannot inspect requests to GitHub Pages, and a JavaScript caller will
miss crawlers that never execute it. A ready-made statistics service cannot
recover observations we never collected.

An authenticated marker could identify cooperating `IMP` automation. Known
crawler signatures could suggest `BOT`, but User-Agent claims are spoofable.
Browser-like headers alone do not justify `HERO?`; ambiguous traffic belongs in
`UNKNOWN`. Counts from a partial Census must not be presented as a breakdown of
Cloudflare's visitor totals.

References: [Cloudflare custom-event limitations](https://developers.cloudflare.com/web-analytics/faq/#does-web-analytics-support-custom-events),
[Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/),
and [GitHub repository traffic](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository).

## Privacy before more machinery

Cloudflare describes Web Analytics as avoiding cookies, local storage, and
fingerprinting. That is useful, but cookie-free is not itself a legal conclusion
about consent. For a German operation, access to information on an end device
and the processing of personal data need separate consideration. A privacy
notice and a consent mechanism serve different purposes; an informational
banner alone would not implement prior consent if consent is required.

Before resuming, clarify what the beacon actually processes, the applicable
legal basis, required privacy information, provider arrangements, and any
international transfers. Then decide whether to operate without consent on a
supported basis, load analytics only after consent, or leave analytics disabled.
No legal clearance is claimed here.

Any future Census should likewise minimize data: no persistent visitor IDs or
invasive fingerprinting, no unnecessary raw IP/header retention, and bounded
route aggregates with an explicit retention policy.

Background: [Cloudflare's product description](https://www.cloudflare.com/web-analytics/),
[§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/BJNR198210021.html),
and [GDPR, including Article 13](https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=celex%3A32016R0679).

The
[architecture notes](https://github.com/dungeonkueper/the-idea-keep/blob/main/ARCHITECTURE.md#analytics-and-dungeon-census)
record the technical boundaries for the proposed evolution.

## Open questions

- What specific question remains after collecting basic page statistics?
- Is a partial census of participating clients useful enough on its own?
- What evidence could justify `HERO?` without identifying or tracking people?
- How should our automation authenticate its `IMP` marker and avoid inflating counts?
- What retention and aggregation would make a public census useful without
  exposing individual observations?

## Conclusion: paused for now

The Dungeon Census is **paused for now — vorerst pausiert**. The idea is worth
keeping, but there is no need to turn a small curiosity into an infrastructure
and privacy project today. No Worker, classifier, custom counters, or public
Census will be built until there is time to resolve those questions and a clear
reason to collect the data.

This records a pause in the Census work. It does not switch off the already
deployed Cloudflare beacon; disabling that remains a separate operational action.
