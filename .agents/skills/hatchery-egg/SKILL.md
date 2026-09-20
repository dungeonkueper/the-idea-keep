---
name: hatchery-egg
description: Create a new Hatchery egg in this repository from the user's request, conversation, and relevant project context. Use when asked to capture, hatch, or draft an idea for The Idea Keep; do not use for general Markdown writing or non-idea content.
---

# Hatchery Egg

Turn one coherent idea from the current context into one reviewable Hatchery entry.

## Gather the idea

- Start with the user's request and the relevant conversation context.
- Inspect the repository's current sources of truth for content metadata and publishing behavior. Read only the documentation, existing entries, or active changes that materially clarify this idea; do not scan the whole workspace by default.
- Infer the writing language from the most relevant existing idea content. Follow an explicit language request instead.
- Identify the core idea, why it is worth keeping, and the hypothesis or question it introduces. If the available context cannot support a clear idea without invention, ask one concise clarifying question and do not create a file yet.

## Prepare the entry

- Derive a concise title, summary, and lowercase kebab-case slug from the idea.
- Use the local calendar date in `YYYY-MM-DD` form.
- Re-read the current content model before choosing metadata. Unless the user explicitly requests otherwise, create an idea with `maturity: seed`, `themedMaturity: egg`, and `publicationStatus: draft`.
- Search existing content for both the intended path and slug. If either already exists, do not overwrite or silently add a suffix; stop and ask the user to approve a different slug.

## Write one egg

- Create exactly one Markdown file in the repository's established ideas directory and make no unrelated changes.
- Follow the repository's current frontmatter order and content conventions.
- Give the entry enough context to stand alone, state a meaningful hypothesis or direction, and retain useful uncertainty or open questions. Treat the existing egg structure as a flexible guide, not a mandatory template.
- An egg may open with a short lore passage when its metaphor makes the idea easier to understand or remember. Aim for roughly 80–180 words, and omit it when it adds no value.
- Clearly separate the lore from the technical body. The lore should establish a useful mental model rather than metaphorically repeat the technical content, and the technical body must remain precise and understandable on its own.
- Write lore in The Idea Keep's own dungeon voice. Do not copy wording, characters, or assets from Dungeon Keeper.
- Do not claim facts that the inspected context does not support.
- Do not commit, publish, or deploy the entry. Set `publicationStatus: published` only when the user explicitly asks for publication.

## Verify and report

- Run the repository's documented validation command. Fix failures caused by the new entry; report unrelated failures without changing unrelated code.
- For a draft, confirm that the build does not emit a detail page or listing for its slug. For a published entry, confirm that both are emitted.
- Report the created path, publication status, the context used, and the validation result.
