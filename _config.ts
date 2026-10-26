import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import { supportJson, testSupport } from "./support_metadata.ts";
import {
  assertUniqueContentUrls,
  contentUrl,
  markdownRepresentation,
  markdownUrl,
  validateContentMetadata,
} from "./content_model.ts";

const site = lume({
  location: new URL("https://dungeonkueper.github.io/the-idea-keep/"),
});

site.use(basePath());
site.add("/styles.css");
site.add("/analytics-consent.js");
site.ignore(
  "README.md",
  "VISION.md",
  "ARCHITECTURE.md",
  "SECURITY.md",
  "tests",
  "experiments",
);

site.data(
  "cloudflareAnalyticsToken",
  Deno.env.get("CLOUDFLARE_WEB_ANALYTICS_TOKEN")?.trim() || undefined,
);

site.preprocess([".md"], (pages, allPages) => {
  // Public deployment configuration only. No payment service is contacted.
  const endpoint = Deno.env.get("FEED_IMPS_SUPPORT_ENDPOINT")?.trim();
  const recipient = Deno.env.get("FEED_IMPS_SUPPORT_RECIPIENT")?.trim();
  if (Boolean(endpoint) !== Boolean(recipient)) {
    throw new Error(
      "Set both FEED_IMPS_SUPPORT_ENDPOINT and FEED_IMPS_SUPPORT_RECIPIENT, or neither.",
    );
  }
  const contentPages = pages
    .filter((page) => page.src.path.startsWith("/content/"))
    .map((page) => ({
      page,
      source: `${page.src.path}${page.src.ext}`,
      metadata: validateContentMetadata(
        {
          ...page.data,
          ...(endpoint && page.data.slug === "feed-the-imps"
            ? {
              support: { ...testSupport, endpoint, recipient },
            }
            : {}),
        } as Record<string, unknown>,
        `${page.src.path}${page.src.ext}`,
      ),
    }));

  assertUniqueContentUrls(contentPages);

  for (const { page, metadata } of contentPages) {
    if (metadata.publicationStatus !== "published") {
      const pageIndex = allPages.indexOf(page);

      if (pageIndex !== -1) {
        allPages.splice(pageIndex, 1);
      }

      continue;
    }

    page.data.url = contentUrl(metadata.kind, metadata.slug);
    page.data.canonicalUrl = new URL(
      page.data.url.slice(1),
      site.options.location,
    ).href;
    page.data.markdownUrl = markdownUrl(metadata.kind, metadata.slug);
    page.data.optionalSupport = metadata.support;
    page.data.supportJson = metadata.support
      ? supportJson(metadata.support)
      : undefined;
    // Capture the canonical body before Markdown rendering and layouts.
    page.data.markdownRepresentation = markdownRepresentation(
      metadata,
      String(page.data.content ?? ""),
      page.data.canonicalUrl,
    );
    page.data.layout = "layouts/article.vto";
    page.data.description = metadata.summary;
    page.data.displayDate = metadata.date.toISOString().slice(0, 10);
    page.data.kindLabel = metadata.kind[0].toUpperCase() +
      metadata.kind.slice(1);
    page.data.maturityLabel = metadata.themedMaturity
      ? `${metadata.themedMaturity[0].toUpperCase()}${
        metadata.themedMaturity.slice(1)
      } / ${metadata.maturity[0].toUpperCase()}${metadata.maturity.slice(1)}`
      : metadata.maturity[0].toUpperCase() + metadata.maturity.slice(1);
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
