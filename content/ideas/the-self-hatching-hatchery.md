---
slug: the-self-hatching-hatchery
kind: idea
maturity: testing
themedMaturity: egg
publicationStatus: published
title: The Self-Hatching Hatchery
summary: A repository-aware agent skill now turns relevant work context into reviewable draft eggs for the Hatchery.
date: 2026-09-20
---

Every new idea in the Hatchery still begins with a small act of translation: noticing something worth keeping, separating it from the surrounding work, and shaping it into an entry. That friction is useful when it sharpens the thought, but less useful when it lets a promising idea disappear into a conversation or a half-finished change.

This egg proposed a recursive tool for that moment: an agent skill that can read the request that invoked it, the conversation around it, and the relevant repository context, then prepare another egg for the Hatchery.

## First observation

A first version now lives with The Idea Keep. It creates one Markdown entry at a time, checks for slug collisions, defaults to a draft, and leaves publication as an editorial decision. The useful next test is whether it captures ideas faithfully enough to reduce friction without flattening their voice.

## Current hypothesis

A context-aware skill can make unfinished thinking easier to capture without turning the Hatchery into an automatic content feed. If it produces a reviewable draft rather than publishing by default, the mechanical work becomes lighter while the editorial decision stays human.

## Initial direction

The first version should live with The Idea Keep and learn its conventions from the repository each time it runs. It should inspect only the context relevant to the idea, follow the established language and content model, and create one new Markdown entry with a unique slug.

Generated eggs should begin as drafts unless publication is explicitly requested. The skill should preserve uncertainty, surface a clear hypothesis, and leave useful open questions instead of inventing confidence that the source material does not support.

## Open questions

- How much context is enough to capture an idea faithfully without pulling in unrelated work?
- Which parts of an egg benefit from a recurring shape, and which should remain free to fit the idea?
- When does the generator save enough effort to encourage publishing, and when does it merely move the editorial work elsewhere?
