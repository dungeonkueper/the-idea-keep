---
slug: feed-the-imps
kind: idea
maturity: testing
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

Markdown with frontmatter remains the canonical source. A TypeScript metadata validator and Deno/Lume build produce static HTML at `/ideas/<slug>/`, a sibling `/ideas/<slug>.md`, and a generated `llms.txt` discovery map containing published entries. All are served through GitHub Pages under `/the-idea-keep/`. An isolated Testnet POC now implements the optional support flow; a public deployment is not yet configured.

The integration is an optional validated `support` field in the shared metadata, exposed by the existing HTML and Markdown representations at their publication boundary. Public endpoint and recipient settings enable it for this one Egg. Without those settings, no operational support offer is advertised. The build only carries descriptive metadata; the independent Worker issues challenges, verifies payments, and returns receipts. No payment SDK or network request belongs in the content build.

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
    "network": "tempo-moderato",
    "chainId": 42431,
    "currency": "0x20c0000000000000000000000000000000000000",
    "endpoint": "https://<worker-host>/support/feed-the-imps",
    "recipient": "<public test recipient address>",
    "suggestedAmount": "0.01"
  }
}
```

This is **our own convention**, not an assumed web standard. The POC fixes the amount to 0.01 test pathUSD (six decimals) on Tempo Moderato, chain 42431. The example above is explanatory prose, not an operational offer. Clients discover live metadata only through the designated HTML JSON block or Markdown metadata line.

## Smallest useful experiment

The POC uses an independently deployable and removable Cloudflare Worker with MPP/mppx for a dedicated support route. One Egg, one endpoint, and one test payment are enough. A single SQLite Durable Object persists atomic replay claims; payment dependencies have their own lockfile and are excluded from the website build.

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

The first implementation **uses only Tempo Testnet**. No production payment credentials or real funds belong in the POC. Cloudflare, MPP/mppx, and Tempo APIs were checked against official documentation and the pinned SDK versions on 2026-09-26. The Worker and client reject other chains.

The current GitHub Pages deployment does not supply a Worker route. The integration advertises an absolute Worker endpoint, leaving the site's `/the-idea-keep/` base path and content hosting unchanged. Local testing uses a loopback endpoint; remote activation requires an HTTPS Worker URL and a configured test recipient.

## Constraints

- Keep all content freely accessible, with no degradation of normal access.
- Do not make content generation depend on MPP or payment service availability.
- Keep the Worker independently deployable and removable.
- Prefer components compatible with Cloudflare's free tier; introduce no paid infrastructure solely for this experiment.
- Keep secrets outside the repository and never log payment credentials or sensitive payment data.
- Keep the implementation intentionally small and avoid premature abstractions.

## First observation: the protocol flow works

On 2026-09-26, a compatible client read the locally served Egg for free, discovered its optional metadata, explicitly chose support, received a 402 challenge, and completed a 0.01 pathUSD transfer on the public Tempo Moderato testnet. The local Cloudflare Worker returned a receipt that the client checked against the confirmed on-chain transfer. Reusing the credential was rejected, and the Egg remained identical and freely readable.

The client creates a disposable faucet-funded account only after `--pay-testnet` is supplied. It does not read existing wallets or retain the private key. The Worker needs a challenge-signing secret and public recipient address, but no wallet private key. No Cloudflare account or remote Worker was provisioned for this test.

The [POC README](https://github.com/dungeonkueper/the-idea-keep/blob/main/experiments/feed-the-imps/README.md) records setup, exact APIs, the receipt reference, dependency choices, and the full reproducible flow. This verifies interoperability; it does not establish willingness to spend real funds.

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

## Remaining questions

- Which Cloudflare account and public test recipient should host a remote trial? The endpoint must be tested before advertising it on the public Keep.
- Can a broader cooperating agent sample distinguish lack of discovery from lack of willingness to pay? The current client measures only its own run.
- What would justify a later real-money experiment? Testnet success alone does not answer that question, and this POC has no production-money mode.
