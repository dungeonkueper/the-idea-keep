---
slug: mapping-the-bedrock
chamber: 10
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: draft
title: Mapping the Bedrock
summary: Write down the Keep's constraints while they are few, separating hard constraints (bedrock) from the design decisions built on them (walls).
date: 2026-11-14
---

<aside class="tales-from-below" aria-labelledby="tales-from-below-heading">
  <h2 id="tales-from-below-heading">Tales from Below</h2>
  <p>Every keeper learns it the same way. The imps dig happily, the corridor grows, and then a pickaxe rings against something that does not chip. Nobody ordered the rock to be there. It was there before the first torch was lit, and it will be there after the last one gutters out.</p>
  <p>A young keeper curses the rock and digs around it. An older one walks the tunnels with chalk and marks every place where the walls refused to move, and next to each mark writes a few words: what it is, who put it there, and what was tried. Half a year later, when a clever imp proposes a shortcut straight through the marked wall, the keeper does not need to remember. The chalk remembers.</p>
  <p>This chamber is the chalk.</p>
</aside>

## Core idea

The Keep documents its vision, architecture and security, but not its constraints: the things that limit which solutions are allowed at all. Today there are few of them and they live in one head. That is exactly when they are cheapest to write down.

## Why keep it

- **Constraints explain decisions.** The Census (chamber 5) is paused and there is no paid address service. Without the constraint next to it, both look like neglect instead of intent.
- **Constraints are forgotten faster than decisions.** The decision stays visible in the code; the reason does not.
- **Constraints expire silently.** A limit that was true in 2026 may be gone in 2027.
- **Agents need them more than humans do.** An agent will happily propose an analytics snippet or a paid service unless the limit is written where it reads.

## Bedrock or wall? The test

> Could a different design make it go away?

- **No → bedrock (hard constraint).** It holds for every possible design of the Keep. It only changes if the world outside changes: the law, a contract, the keeper's budget.
- **Yes → wall (design decision).** The Keep chose it, usually _because_ of some bedrock. It can be rebuilt if someone pays the price.

Permanent chamber numbers are a wall: change the design and they can go. The legal notice is bedrock: no design removes it.

## Bedrock: hard constraints

| ID | Constraint                                                                     | Source                                         | Holds as long as                        | Status                            |
| -- | ------------------------------------------------------------------------------ | ---------------------------------------------- | --------------------------------------- | --------------------------------- |
| B1 | A legal notice (Impressum) with real name and postal address must be published | Law                                            | The site is public and run from Germany | Met                               |
| B2 | No non-essential tracking or device storage without consent                    | Law                                            | Same                                    | Met (nothing is tracked)          |
| B3 | Visitors must be told which personal data is processed, including by the host  | Law                                            | Same                                    | **Open** – privacy notice missing |
| B4 | Nothing may be taken from Dungeon Keeper or other third-party works            | Third-party IP                                 | Always                                  | Met                               |
| B5 | Nothing from the keeper's employment: no internals, private views only         | Employment                                     | Employed                                | Met                               |
| B6 | No running costs                                                               | Keeper (hobby project without foreseeable ROI) | The Keep earns nothing                  | Met                               |
| B7 | One keeper, limited hours: nothing that needs operating, patching or on-call   | Keeper                                         | One-person project                      | Met                               |

B6 and B7 are set by the keeper rather than by the outside world. They still count as bedrock, because no design can change them; only the keeper can.

## Walls: design decisions

Written as Y-statements: _In the context of … facing … we decided for … and against … to achieve … accepting … because …_

### D1 – Static site on free hosting

In the context of hosting the Keep, facing B6 and B7, we decided for a static site on a free hosting tier and against a self-run server or paid hosting, to achieve zero cost and zero operations, accepting that there is no backend and that the host's terms and limits apply, because anything that runs must be paid for and looked after.

### D2 – Public repository

In the context of source control, facing B6 and D1, we decided for a single public repository and against a private or split setup, to achieve free hosting and visible work in progress, accepting that everything including the history is world-readable, because the free tier publishes from public repositories and "unfinished is publishable" is the point. _Under review: the public/private split._

### D3 – Own address in the legal notice

In the context of B1, facing B6, we decided for the keeper's own name and address and against a paid address service, to achieve compliance at no cost, accepting that personal data is public, because a monthly fee is out of proportion for a hobby project.

### D4 – Census paused instead of a consent flow

In the context of visitor counting, facing B2, we decided for pausing the Census and against a consent banner or third-party analytics, to achieve a site without any consent dialog, accepting that the Keep knows nothing about its readers, because a banner costs more attention than the numbers are worth today.

### D5 – Every entry as HTML and as layout-free Markdown

In the context of presentation, facing readers who are both humans and agents, we decided for two renderings of every entry and against HTML only, to achieve content agents can read without scraping, accepting that nothing may exist only as interactive UI, because serving different audiences is part of the Keep's vision.

### D6 – Permanent chamber numbers

In the context of referencing entries, facing drafts that come and go, we decided for fixed numbers that are never reused and against renumbering, to achieve stable references, accepting gaps in the sequence, because a number that changes meaning is worse than a missing one.

### D7 – Hermetic build

In the context of building the site, facing supply-chain risk, we decided for a frozen lockfile and a build without network or subprocesses and against convenience tooling that fetches or shells out, to achieve a reproducible, auditable build, accepting that some tools cannot be used, because the build is the Keep's largest attack surface (see SECURITY.md).

### D8 – Agent changes only through human review

In the context of agentic development, facing agents as fast but untrusted contributors, we decided for pull requests reviewed by the keeper and against autonomous merging or publishing, to achieve one accountable human for everything public, accepting slower throughput, because the keeper's name is on the legal notice.

### D9 – Test networks only for payments

In the context of "Feed the Imps", facing tax, liability and platform-terms questions around real money, we decided for testnet only and against live payments, to achieve a safe experiment, accepting that nothing is ever actually received, because going live would also end "earns nothing" in B6 and deserves its own decision.

## How they hang together

- B6 + B7 → D1 → D2
- B1 + B6 → D3
- B2 → D4
- D2 + D3 → the keeper's address sits in a world-readable repository. This is the known sore spot, and it is made of walls, not bedrock.

## Candidates still to check

- No third-party embeds (fonts, CDNs, widgets): follows from B2/B3; verify the built site.
- Limits and usage rules of the free hosting tier (consequence of D1).
- Reports about real incidents ("Tidings"): facts with sources, opinion separated, nothing reposted.
- Runtime and generator choice (Deno, Lume): a decision whose rationale is not written down yet; the runtime's future is uncertain.
- Accessibility and mobile: reduced-motion fallback for flicker effects.
- Licence of the Keep's own content and code.

## Open questions

- Where does this live permanently: a `CONSTRAINTS.md` next to `SECURITY.md`, or only this chamber?
- How do agents get it: linked from `llms.txt` and the agent instructions?
- What triggers a review: a new wing, a new external service, a new platform?

## Hypothesis

A short, maintained list that separates bedrock from walls reduces rework: proposals that violate bedrock are caught before a PR exists, and proposals that move a wall are recognised as what they are, a design change with a price.
