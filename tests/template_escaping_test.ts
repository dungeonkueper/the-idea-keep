import site from "../_config.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// Characters that break HTML text or a double-quoted attribute when emitted raw.
const hostile = `Quotes " and 'apostrophes' & <angle> brackets`;
const escaped =
  "Quotes &quot; and &apos;apostrophes&apos; &amp; &lt;angle&gt; brackets";

const engine = site.formats.get(".vto")?.engines?.[0];
assert(engine, "Vento engine is not registered");
// Index the source tree so the layouts can resolve their includes.
site.fs.init();

async function render(path: string, data: Record<string, unknown>) {
  const source = (await Deno.readTextFile(path))
    .replace(/^---\n[\s\S]*?\n---\n/, "");
  const html = await engine!.render(source, data, `/${path}`);
  assert(typeof html === "string", `Rendering ${path} failed`);
  return html;
}

const article = {
  title: hostile,
  summary: hostile,
  kind: "idea",
  maturity: "seed",
  chamber: 1,
  chamberLabel: "I",
  displayDate: "2026-01-01",
  url: "/ideas/hostile/",
};

Deno.test("base layout escapes page metadata but keeps rendered content", async () => {
  const html = await render("_includes/layouts/base.vto", {
    title: hostile,
    description: hostile,
    content: "<p>Rendered <em>body</em></p>",
  });
  assert(
    html.includes(`<title>${escaped} · The Idea Keep</title>`),
    "Title is not escaped",
  );
  assert(
    html.includes(`<meta name="description" content="${escaped}">`),
    "Description attribute is not escaped",
  );
  assert(
    html.includes("<p>Rendered <em>body</em></p>"),
    "Rendered page content must not be escaped",
  );
  assert(!html.includes(hostile), "Raw metadata leaked into the HTML");
});

Deno.test("article layout escapes title and summary", async () => {
  const html = await render("_includes/layouts/article.vto", {
    ...article,
    markdownUrl: "/ideas/hostile.md",
    content: "<p>Body</p>",
    search: { pages: () => [] },
  });
  assert(html.includes(`<h1>${escaped}</h1>`), "Heading is not escaped");
  assert(
    html.includes(`<p class="article-summary">${escaped}</p>`),
    "Summary is not escaped",
  );
  assert(html.includes("<p>Body</p>"), "Article body must not be escaped");
  assert(!html.includes(hostile), "Raw metadata leaked into the HTML");
});

Deno.test("home page escapes titles in text and attributes", async () => {
  const html = await render("index.vto", {
    search: {
      pages: (query: string) => query.includes("kind=idea") ? [article] : [],
    },
  });
  assert(
    html.includes(`aria-label="Read ${escaped}"`),
    "Title inside aria-label is not escaped",
  );
  assert(html.includes(`<p>${escaped}</p>`), "Summary is not escaped");
  assert(!html.includes(hostile), "Raw metadata leaked into the HTML");
});
