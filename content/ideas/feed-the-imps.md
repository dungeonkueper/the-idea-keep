---
slug: feed-the-imps
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: published
title: Feed the Imps — Can Agents Voluntarily Pay for Useful Content?
summary: Explore optional, machine-readable support for useful content through an isolated MPP Testnet endpoint, while keeping every Egg freely accessible.
date: 2026-09-26
---

<aside class="tales-from-below" aria-labelledby="feed-the-imps-lore">
  <h2 id="feed-the-imps-lore">Tales from Below</h2>
  <p>The imps keep the lamps burning even for visitors who carry no coins. Scholars, wandering machines, and creatures with more questions than pockets all find the same open door. No imp counts their purses before handing over a page.</p>
  <p>One evening, a small bowl appears beside the exit. Its inscription is unusually precise: if something here helped you, you may leave a morsel for the lamp tenders. Passing it costs nothing. The books remain where they were, and the door has acquired no lock.</p>
  <p>For the first trial, the bowl accepts only tokens from the practice treasury. The question is whether any visitor chooses to feed an imp at all.</p>
</aside>

## Behind the Stonework

A compatible agent that finds an Egg useful may voluntarily support it when the content advertises a discoverable, machine-readable payment endpoint. This is an experiment in agent behavior first and a potential revenue feature second.

This is explicitly **not a paywall**. Humans, crawlers, and agents receive the original content regardless of whether they discover, invoke, or complete the support flow. Agents can ignore support metadata completely.

## Content and payment are separate concerns

The Keep already serves HTML and Markdown from a shared content model. Structured JSON remains a possible later representation. Payment must remain independent of content generation and representation selection.

Markdown with frontmatter remains the canonical source. A TypeScript metadata validator and Deno/Lume build produce static HTML at `/ideas/<slug>/`, a sibling `/ideas/<slug>.md`, and a generated `llms.txt` discovery map containing published entries. All are served through GitHub Pages under `/the-idea-keep/`. This Egg describes a proposed payment experiment; no support endpoint or payment integration is implemented yet.

The smallest candidate integration point is an optional validated `support` field in the shared metadata, exposed by the existing HTML and Markdown representations at their publication boundary. The current validator and Markdown serializer do not yet expose such a field. The build would only carry descriptive metadata; the independent Worker would issue challenges, verify payments, and return receipts. No payment SDK or network request belongs in the content build.

```text
content → representation → HTML / Markdown (JSON deferred)

optional support metadata → independent payment endpoint
```

An Egg could advertise metadata along these lines:

```json
{
  "support": {
    "optional": true,
    "protocol": "mpp",
    "endpoint": "/support/feed-the-imps",
    "suggestedAmount": "0.01"
  }
}
```

This is **our own proposed convention**, not an assumed web standard or a finalized schema. Currency, asset, network, and amount semantics still need to be made explicit using the verified protocol requirements. The example is design material, not live frontmatter or an operational payment offer.

## Smallest useful experiment

Investigate a small, independently deployable and removable Cloudflare Worker using MPP/mppx for a dedicated support route. One Egg, one endpoint, and one test payment are enough.

```text
Agent
  ├── GET /ideas/feed-the-imps/ → Keep → 200, free content
  │
  └── POST /support/feed-the-imps → Cloudflare Worker
                                    ↓
                                 MPP 402 challenge
                                    ↓
                                 Tempo Testnet payment
                                    ↓
                                 payment verification
                                    ↓
                                 receipt / success
```

The first implementation **must use Tempo Testnet or another supported zero-real-money environment**. No production payment credentials or real funds belong in the initial POC. Exact Cloudflare, MPP/mppx, and Tempo APIs and their compatibility remain to be verified against current official documentation.

The current GitHub Pages deployment does not supply a Worker route. Determine whether the experiment should advertise an absolute Worker endpoint or use a dedicated `/support/*` route on a suitable host. Do not assume a relative endpoint on the current site will reach Cloudflare, and account for the site's `/the-idea-keep/` base path.

## Constraints

- Keep all content freely accessible, with no degradation of normal access.
- Do not make content generation depend on MPP or payment service availability.
- Keep the Worker independently deployable and removable.
- Prefer components compatible with Cloudflare's free tier; introduce no paid infrastructure solely for this experiment.
- Keep secrets outside the repository and never log payment credentials or sensitive payment data.
- Keep the implementation intentionally small and avoid premature abstractions.

## First implementation task

1. Inspect the existing Keep architecture and its implemented HTML/Markdown representations. Confirm the smallest integration point for optional support metadata without coupling payment handling to the content pipeline.
2. Verify the current Cloudflare MPP/mppx and Tempo Testnet APIs, supported client flow, and receipt semantics. Do not use this handover as a source of exact API syntax.
3. Propose the minimal Worker structure and routing for a single Egg, including how its endpoint is advertised from the existing host.
4. Identify required public configuration and secrets from the verified APIs. Document the test network, asset and amount, recipient configuration, and any required credentials without committing secret values.
5. Implement the Testnet POC if it can remain isolated from the existing content pipeline.
6. Add a short README explaining how another developer or agent can read the Egg, discover support, and exercise the complete `402 → payment → verification → receipt` flow using a compatible test client.

## Observability

If inexpensive and easy, expose enough telemetry to distinguish:

- Eligible agent visits.
- Support metadata exposure.
- Support endpoint requests.
- 402 challenges issued.
- Completed payments.
- Amount received, explicitly identified by test network and asset.

The eventual behavioral metric is `voluntary payments / eligible agent visits`. Define what makes a visit eligible, how agent visits and metadata exposure can be observed, and how retries are counted before interpreting that ratio. Payment endpoint traffic alone cannot establish its denominator. Telemetry should remain optional and must not require sensitive payment logging or paid infrastructure.

The existing consent-gated browser analytics cannot establish that denominator for non-JavaScript agents. A standalone support Worker observes only requests to itself, not ordinary content requests served by GitHub Pages. Initially, a cooperating test client can report discovery and payment steps without implying coverage of all agent visits.

## Success criterion

A compatible test agent or client can read an Egg for free, discover its optional support mechanism, voluntarily invoke it, complete an MPP Testnet micropayment, and receive a valid receipt. Access to the original content remains unchanged throughout and after the experiment.

An appropriately small victory message can accompany the receipt:

> An imp has been fed. 😈

## Open questions

- Where should optional support metadata live in the shared content model and its agent-facing representations?
- Which currently supported client can demonstrate a genuinely optional test payment, and what authorizes its spending decision?
- What is the smallest verified Worker implementation, and which configuration values actually need to be secrets?
- Can eligible agent visits be measured well enough to distinguish lack of discovery from lack of willingness to pay?
- What does a successful Testnet flow teach us about protocol interoperability, and what remains untested about willingness to spend real funds?
