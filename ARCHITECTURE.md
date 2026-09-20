# Architecture

> **Status: Initial direction.** These choices are a practical starting point, not permanent commitments. Revisit them when the content or publishing workflow creates a concrete need.

## Goals

- Keep the first version low-cost and simple to operate.
- Make publishing from version-controlled Markdown straightforward.
- Treat the generated website as portable static output.
- Keep content concepts clear enough to support future search, relationships, or a database-backed implementation if needed.

## Initial direction

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

- **Runtime and site generator:** Deno with Lume, producing a static site from Markdown and frontmatter.
- **Content source:** Markdown files stored in the repository. Content remains reviewable and editable with ordinary tools.
- **Hosting:** Start with GitHub Pages, since the project already uses GitHub. Keep the build command and generated output independent of the hosting provider so another static host can be used later.
- **Analytics:** Cloudflare Web Analytics is an optional addition for understanding reach and performance. It does not require moving the site hosting or DNS to Cloudflare.
- **Application backend:** None is needed for the initial static site. Reconsider a server or database if requirements such as browser-based editing, accounts, or dynamic experiences become central.

## Content model

Keep three independent dimensions in content metadata:

| Dimension | Describes | Initial values |
| --- | --- | --- |
| `kind` | What the item is | `idea`, `experiment`, `learning`, `project`, `artifact` |
| `maturity` | How developed or supported it is | `seed`, `testing`, `working-theory`, `validated`, `discarded`, `dormant` |
| `publicationStatus` | Whether it is visible on the site | `draft`, `published`, `archived` |

This separation allows, for example, a discarded experiment to be published as a useful learning. The first content entry uses `kind: idea`, `maturity: seed`, and `publicationStatus: draft`.

Content may link to related items as the collection grows. For now, Markdown files are the source of truth; a database and ORM are not part of the initial implementation. If that changes, preserve a boundary between content parsing/storage and site rendering so a new storage adapter can be introduced without rewriting the entire site.

## Portability and trade-offs

The build should produce ordinary HTML, CSS, JavaScript, and assets in a static output directory. CI should invoke the project build and publish that output; host-specific workflow configuration should not contain the site's core build logic. This keeps a move from GitHub Pages to another static host largely a deployment and domain configuration change.

GitHub Pages is a convenient first host, while Cloudflare Analytics is an optional measurement tool. Neither choice should shape the content model or require the site to run on that provider.

## Revisit when

Reassess this direction if publishing becomes cumbersome, content volume calls for a different authoring workflow, or the site needs dynamic capabilities such as accounts, comments, or interactive server-backed features.
