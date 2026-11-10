import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import {
  assertUniqueChambers,
  assertUniqueContentUrls,
  contentUrl,
  markdownRepresentation,
  markdownUrl,
  tidingMarkdownRepresentation,
  tidingMarkdownUrl,
  tidingUrl,
  toRomanNumeral,
  validateContentMetadata,
  validateTidingBody,
  validateTidingMetadata,
} from "./content_model.ts";

const site = lume({
  location: new URL("https://dungeonkueper.github.io/the-idea-keep/"),
});

site.use(basePath());
site.add("/styles.css");
site.add("/images/");
// Self-hosted JetBrains Mono (Latin subset) with its OFL licence.
site.add("/fonts/");
site.add("/analytics-consent.js");
site.ignore(
  "README.md",
  "VISION.md",
  "ARCHITECTURE.md",
  "SECURITY.md",
  "tests",
);

site.data(
  "cloudflareAnalyticsToken",
  Deno.env.get("CLOUDFLARE_WEB_ANALYTICS_TOKEN")?.trim() || undefined,
);

const isTidingSource = (path: string) => path.startsWith("/content/tidings/");

site.preprocess([".md"], (pages, allPages) => {
  const unpublish = (page: (typeof pages)[number]) => {
    const pageIndex = allPages.indexOf(page);

    if (pageIndex !== -1) {
      allPages.splice(pageIndex, 1);
    }
  };

  // Tidings form their own wing: no chambers, own routes, dated revisions.
  const tidingPages = pages
    .filter((page) => isTidingSource(page.src.path))
    .map((page) => {
      const source = `${page.src.path}${page.src.ext}`;
      const metadata = validateTidingMetadata(
        page.data as Record<string, unknown>,
        source,
      );
      validateTidingBody(metadata, String(page.data.content ?? ""), source);
      return { page, source, metadata };
    });
  const tidingSources = new Map<string, string>();

  for (const { page, source, metadata } of tidingPages) {
    const existingSource = tidingSources.get(metadata.slug);

    if (existingSource) {
      throw new Error(
        `${source}: public URL '${
          tidingUrl(metadata.slug)
        }' duplicates ${existingSource}.`,
      );
    }

    tidingSources.set(metadata.slug, source);

    if (metadata.publicationStatus !== "published") {
      unpublish(page);
      continue;
    }

    page.data.url = tidingUrl(metadata.slug);
    page.data.canonicalUrl = new URL(
      page.data.url.slice(1),
      site.options.location,
    ).href;
    page.data.markdownUrl = tidingMarkdownUrl(metadata.slug);
    page.data.markdownRepresentation = tidingMarkdownRepresentation(
      metadata,
      String(page.data.content ?? ""),
      page.data.canonicalUrl,
    );
    page.data.layout = "layouts/article.vto";
    page.data.tags = metadata.tags;
    page.data.description = metadata.summary;
    page.data.firstDate = metadata.first.toISOString().slice(0, 10);
    page.data.displayDate = metadata.updated.toISOString().slice(0, 10);
  }

  const contentPages = pages
    .filter((page) =>
      page.src.path.startsWith("/content/") && !isTidingSource(page.src.path)
    )
    .map((page) => ({
      page,
      source: `${page.src.path}${page.src.ext}`,
      metadata: validateContentMetadata(
        page.data as Record<string, unknown>,
        `${page.src.path}${page.src.ext}`,
      ),
    }));

  assertUniqueContentUrls(contentPages);
  assertUniqueChambers(contentPages);

  for (const { page, metadata } of contentPages) {
    if (metadata.publicationStatus !== "published") {
      unpublish(page);
      continue;
    }

    page.data.url = contentUrl(metadata.kind, metadata.slug);
    page.data.canonicalUrl = new URL(
      page.data.url.slice(1),
      site.options.location,
    ).href;
    page.data.markdownUrl = markdownUrl(metadata.kind, metadata.slug);
    // Capture the canonical body before Markdown rendering and layouts.
    page.data.markdownRepresentation = markdownRepresentation(
      metadata,
      String(page.data.content ?? ""),
      page.data.canonicalUrl,
    );
    page.data.layout = "layouts/article.vto";
    page.data.chamber = metadata.chamber;
    page.data.chamberLabel = toRomanNumeral(metadata.chamber);
    page.data.description = metadata.summary;
    page.data.displayDate = metadata.date.toISOString().slice(0, 10);
  }
});

// Emit plain text after rendering so Markdown is never rendered a second time.
// Derive the map from this build's pages, including during watch rebuilds.
site.process([".html"], async (pages) => {
  const entries = pages.filter((page) => page.data.markdownRepresentation)
    .sort((a, b) => String(a.data.url).localeCompare(String(b.data.url)));
  const map = [
    "# The Idea Keep",
    "> A public lab book for ideas, experiments, learnings, projects, and artifacts.",
    "HTML and Markdown expose the same published content, including optional lore. " +
    "Maturity describes how developed an idea is, not a guarantee of correctness. " +
    "This is a discovery map, not crawler policy or coding-agent instructions.",
    `## Start here\n\n- [The Keep](${site.options.location.href}): Browse the published collection.`,
    "## Published content",
  ];
  for (const page of entries) {
    const markdown = await site.getOrCreatePage(page.data.markdownUrl);
    markdown.content = page.data.markdownRepresentation;
    // Let watch-mode cleanup remove the alternate when its source is unpublished,
    // renamed, or deleted, just as it removes the corresponding HTML output.
    markdown.src.entry = page.src.entry;
    const url = new URL(page.data.markdownUrl.slice(1), site.options.location);
    const title = String(page.data.title).replace(/[\r\n]+/g, " ")
      .replace(/([\\[\]])/g, "\\$1");
    const summary = String(page.data.summary).replace(/[\r\n]+/g, " ");
    map.push(`- [${title}](${url.href}): ${summary}`);
  }
  (await site.getOrCreatePage("/llms.txt")).content = map.join("\n\n") + "\n";
});

export default site;
