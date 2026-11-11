import { type ContentKind, contentUrl, markdownUrl } from "./content_model.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const location = "https://dungeonkueper.github.io/the-idea-keep";

async function assertMissing(path: string) {
  try {
    await Deno.stat(`_site/${path}`);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return;
    throw error;
  }
  throw new Error(`Unpublished output: ${path}`);
}

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
  let tidings = 0;
  const files: { section: string; name: string }[] = [];
  for await (const directory of Deno.readDir("content")) {
    if (!directory.isDirectory) continue;
    for await (const file of Deno.readDir(`content/${directory.name}`)) {
      if (file.name.endsWith(".md")) {
        files.push({ section: directory.name, name: file.name });
      }
    }
  }
  for (const file of files) {
    const source = (await Deno.readTextFile(
      `content/${file.section}/${file.name}`,
    )).replace(/\r\n/g, "\n");
    const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    assert(match, `Missing frontmatter: ${file.name}`);
    const [, frontmatter, body] = match;
    const slug = frontmatter.match(/^slug: (.+)$/m)?.[1];
    const title = frontmatter.match(/^title: (.+)$/m)?.[1];
    const summary = frontmatter.match(/^summary: (.+)$/m)?.[1];
    if (file.section === "tidings") {
      assert(/^wing: tidings$/m.test(frontmatter), `Wing: ${file.name}`);
      assert(slug && title && summary, `Missing metadata: ${file.name}`);
      const outputs = [`tidings/${slug}.md`, `tidings/${slug}/index.html`];
      if (!/^publicationStatus: published$/m.test(frontmatter)) {
        assert(!home.includes(slug) && !map.includes(slug), `Leaked ${slug}`);
        for (const path of outputs) await assertMissing(path);
        continue;
      }
      tidings++;
      const markdown = (await Deno.readTextFile(`_site/${outputs[0]}`))
        .replace(/\r\n/g, "\n");
      const html = await Deno.readTextFile(`_site/${outputs[1]}`);
      assert(markdown.startsWith(`# ${title}\n\n${summary}`), slug);
      assert(markdown.endsWith(body.trimStart()), `Body changed: ${slug}`);
      assert(markdown.includes("\nWing: tidings\n"), `Wing: ${slug}`);
      assert(!markdown.includes("\nChamber:"), `Chamber: ${slug}`);
      assert(!html.includes("CHAMBER"), `Chamber: ${slug}`);
      assert(
        html.includes(`rel="canonical" href="${location}/tidings/${slug}/"`),
        slug,
      );
      assert(html.includes(`href="/the-idea-keep/tidings/${slug}.md"`), slug);
      assert(map.includes(`(${location}/tidings/${slug}.md)`), `Map: ${slug}`);
      assert(home.includes(`href="/the-idea-keep/tidings/${slug}/"`), slug);
      continue;
    }
    const chamber = frontmatter.match(/^chamber: (\d+)$/m)?.[1];
    const kind = frontmatter.match(/^kind: (.+)$/m)?.[1];
    assert(
      slug && title && summary && chamber && kind,
      `Missing metadata: ${file.name}`,
    );
    const section = contentUrl(kind as ContentKind, slug).split("/")[1];
    assert(section === file.section, `Wrong directory: ${file.name}`);
    if (!/^publicationStatus: published$/m.test(frontmatter)) {
      assert(!home.includes(slug) && !map.includes(slug), `Leaked ${slug}`);
      for (
        const path of [`${section}/${slug}.md`, `${section}/${slug}/index.html`]
      ) {
        await assertMissing(path);
      }
      continue;
    }
    published++;
    const markdown = (await Deno.readTextFile(`_site/${section}/${slug}.md`))
      .replace(/\r\n/g, "\n");
    const html = await Deno.readTextFile(`_site/${section}/${slug}/index.html`);
    assert(
      markdown.startsWith(`# ${title}\n\n${summary}`),
      `Metadata: ${slug}`,
    );
    assert(markdown.endsWith(body.trimStart()), `Body changed: ${slug}`);
    assert(
      markdown.includes(`Canonical: <${location}/${section}/${slug}/>`),
      slug,
    );
    assert(markdown.includes(`\nChamber: ${chamber}\n`), `Chamber: ${slug}`);
    assert(html.includes(`Chamber ${chamber}</span>`), `Chamber: ${slug}`);
    assert(!map.includes("Chamber"), "Map lists chambers");
    assert(
      html.includes(`rel="canonical" href="${location}/${section}/${slug}/"`),
      slug,
    );
    assert(html.includes(`href="/the-idea-keep/${section}/${slug}.md"`), slug);
    assert(html.includes('rel="alternate" type="text/markdown"'), slug);
    assert(map.includes(`(${location}/${section}/${slug}.md)`), `Map: ${slug}`);
    assert(
      !home.includes(`href="/the-idea-keep/${section}/${slug}.md"`),
      `Duplicate card: ${slug}`,
    );
  }
  assert(published > 0, "No published content exercised");
  assert(
    (map.match(/\.md\)/g) ?? []).length === published + tidings,
    "Stale map entries",
  );
  assert(
    (home.match(/class="chamber-card"/g) ?? []).length === published,
    "Duplicate cards",
  );
  assert(
    (home.match(/class="chamber-card tiding-card"/g) ?? []).length === tidings,
    "Tiding cards",
  );
  assert(home.includes('id="tidings-title"') === tidings > 0, "Tidings wing");
  assert(
    home.includes('href="/the-idea-keep/llms.txt"'),
    "Map not discoverable",
  );
});
