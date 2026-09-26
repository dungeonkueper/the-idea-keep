---
slug: signposts-for-heroes-and-imps
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: draft
title: Signposts for Heroes and Imps
summary: One canonical content source can serve atmospheric HTML for people and compact Markdown for agents, with honest signposts between them.
date: 2026-09-26
---

## Tales from Below

At the entrance to the Keep, a hero pauses beneath a carved arch. An imp beside her barely looks up: it is counting doors, checking room numbers, and making a list of passages still unexplored. The arch gives the hero a reason to enter. The numbers give the imp a way to return. Neither helps much if the signs lead to different rooms. The keeper therefore orders one ledger for the whole dungeon. Carvers may dress its entries in stone; scribes may copy them onto small travelling cards. But when a chamber changes, every sign must follow the ledger. A beautiful gate and an accurate map can serve the same place.

## Behind the Stonework

The Keep's audience includes people, crawlers, LLMs, and autonomous agents. Their preferred presentation differs, but the factual content should not. The working hypothesis is that a single version-controlled content record can serve all of them without an independent editorial workflow for each audience.

Heroes get atmosphere. Imps get structure. Both get the same truth.

## First architectural slice

Markdown with validated frontmatter remains the canonical record. The existing kind and slug identify its stable public route; maturity and publication status remain separate concerns. HTML includes navigation, theme, summary, and the rendered body. A sibling `.md` file includes the same title, summary, metadata, and complete original body, without the surrounding site layout.

For example, the published starting egg has both `/ideas/the-chicken-egg-problem/` and `/ideas/the-chicken-egg-problem.md`. This egg will receive equivalent routes if it is published. Keeping the existing `/ideas/` namespace avoids introducing a competing `/eggs/` identity.

The optional lore and the factual corpus remain explicitly headed sections in the same body. Existing semantic HTML asides are retained in Markdown rather than removed by a lossy conversion. A separate set of lore and corpus fields is unnecessary for this first slice; a later structured representation should preserve these boundaries without duplicating author-maintained prose.

## Signposts and equal truth

The build generates `llms.txt` at the site root from published records and links to their Markdown representations. Each article links to its alternate representation, and Markdown names the canonical HTML URL. On the current GitHub Pages project site, the map lives below `/the-idea-keep/`, not at the origin root.

This map helps external agents discover content. It neither replaces semantic HTML, page descriptions, sitemaps, or `robots.txt`, nor serves the repository-instruction role of `AGENTS.md`. It is an optional discovery convention, not a promise that crawlers will use it.

Representations are static and available to everyone. There is no user-agent detection, special advertising, hidden editorial content, or agent-specific factual claim. Drafts and archived entries are excluded from every published representation and the map.

## Open questions

- When would a concrete consumer justify JSON with explicit lore, corpus, references, and relationships?
- Should compact excerpts become useful later, how can their omissions remain obvious and their connection to the complete canonical record verifiable?
- When the collection grows, which additional navigation, sitemap, and relationship metadata will help both people and machines?

## Related content

- [The Chicken-Egg Problem](https://dungeonkueper.github.io/the-idea-keep/ideas/the-chicken-egg-problem/)
- [Setting a Proper Dungeon Atmosphere](https://dungeonkueper.github.io/the-idea-keep/ideas/setting-a-proper-dungeon-atmosphere/)

Relative references should resolve from both published representations; for references to other entries, prefer full canonical URLs until a shared link-resolution convention is implemented.
