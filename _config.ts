import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import {
  assertUniqueContentUrls,
  contentUrl,
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
);

site.data(
  "cloudflareAnalyticsToken",
  Deno.env.get("CLOUDFLARE_WEB_ANALYTICS_TOKEN")?.trim() || undefined,
);

site.preprocess([".md"], (pages, allPages) => {
  const contentPages = pages
    .filter((page) => page.src.path.startsWith("/content/"))
    .map((page) => ({
      page,
      source: `${page.src.path}${page.src.ext}`,
      metadata: validateContentMetadata(
        page.data as Record<string, unknown>,
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

export default site;
