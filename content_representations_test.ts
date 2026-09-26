import { contentUrl, markdownUrl } from "./content_model.ts";
import { validateSupport } from "./support_metadata.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const location = "https://dungeonkueper.github.io/the-idea-keep";

Deno.test("all content kinds keep stable HTML and sibling Markdown routes", () => {
  for (
    const [kind, section] of [
      ["idea", "ideas"],
      ["experiment", "experiments"],
      ["learning", "learnings"],
      ["project", "projects"],
      ["artifact", "artifacts"],
    ] as const
  ) {
    assert(contentUrl(kind, "test") === `/${section}/test/`, kind);
    assert(markdownUrl(kind, "test") === `/${section}/test.md`, kind);
  }
});

Deno.test("built representations preserve source bodies and publication boundaries", async () => {
  const home = await Deno.readTextFile("_site/index.html");
  const map = await Deno.readTextFile("_site/llms.txt");
  let published = 0;
  for await (const file of Deno.readDir("content/ideas")) {
    if (!file.name.endsWith(".md")) continue;
    const source = (await Deno.readTextFile(`content/ideas/${file.name}`))
      .replace(/\r\n/g, "\n");
    const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    assert(match, `Missing frontmatter: ${file.name}`);
    const [, frontmatter, body] = match;
    const slug = frontmatter.match(/^slug: (.+)$/m)?.[1];
    const title = frontmatter.match(/^title: (.+)$/m)?.[1];
    const summary = frontmatter.match(/^summary: (.+)$/m)?.[1];
    assert(slug && title && summary, `Missing metadata: ${file.name}`);
    if (!/^publicationStatus: published$/m.test(frontmatter)) {
      assert(!home.includes(slug) && !map.includes(slug), `Leaked ${slug}`);
      for (const path of [`ideas/${slug}.md`, `ideas/${slug}/index.html`]) {
        try {
          await Deno.stat(`_site/${path}`);
        } catch (error) {
          if (error instanceof Deno.errors.NotFound) continue;
          throw error;
        }
        throw new Error(`Unpublished output: ${path}`);
      }
      continue;
    }
    published++;
    const markdown = (await Deno.readTextFile(`_site/ideas/${slug}.md`))
      .replace(/\r\n/g, "\n");
    const html = await Deno.readTextFile(`_site/ideas/${slug}/index.html`);
    const markdownSupport = markdown.match(/^Support: (\{.+\})$/m)?.[1];
    if (slug === "feed-the-imps") {
      assert(
        Boolean(markdownSupport) ===
          Boolean(Deno.env.get("FEED_IMPS_SUPPORT_ENDPOINT")),
        "Support opt-in setting not reflected in output",
      );
    }
    const htmlSupport = html.match(
      /<script type="application\/json" id="optional-support">([^]*?)<\/script>/,
    )?.[1];
    assert(
      markdownSupport === htmlSupport,
      `Support differs between representations: ${slug}`,
    );
    if (markdownSupport) {
      validateSupport(JSON.parse(markdownSupport).support, slug);
      assert(
        html.includes("This Egg is free to read"),
        "Missing optional support explanation",
      );
    }
    assert(
      markdown.startsWith(`# ${title}\n\n${summary}`),
      `Metadata: ${slug}`,
    );
    assert(markdown.endsWith(body.trimStart()), `Body changed: ${slug}`);
    assert(markdown.includes(`Canonical: <${location}/ideas/${slug}/>`), slug);
    assert(
      html.includes(`rel="canonical" href="${location}/ideas/${slug}/"`),
      slug,
    );
    assert(html.includes(`href="/the-idea-keep/ideas/${slug}.md"`), slug);
    assert(html.includes('rel="alternate" type="text/markdown"'), slug);
    assert(map.includes(`(${location}/ideas/${slug}.md)`), `Map: ${slug}`);
    assert(
      !home.includes(`href="/the-idea-keep/ideas/${slug}.md"`),
      `Duplicate card: ${slug}`,
    );
  }
  assert(published > 0, "No published content exercised");
  try {
    await Deno.stat("_site/experiments/feed-the-imps");
    throw new Error("Worker sources leaked into the public site");
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
  assert(
    (map.match(/\.md\)/g) ?? []).length === published,
    "Stale map entries",
  );
  assert(
    (home.match(/class="content-card"/g) ?? []).length === published,
    "Duplicate cards",
  );
  assert(
    home.includes('href="/the-idea-keep/llms.txt"'),
    "Map not discoverable",
  );
});
