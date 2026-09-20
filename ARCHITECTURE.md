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

## Revisit when

Reassess this direction if publishing becomes cumbersome, content volume calls for a different authoring workflow, or the site needs dynamic capabilities such as accounts, comments, or interactive server-backed features.
