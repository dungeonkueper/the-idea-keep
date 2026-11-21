function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const aboutPages = ["about", "about-me"] as const;

async function readIfBuilt(path: string): Promise<string | undefined> {
  try {
    return await Deno.readTextFile(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return undefined;
    throw error;
  }
}

Deno.test("about pages are built only once their placeholders are filled in", async () => {
  const home = await Deno.readTextFile("_site/index.html");
  for (const page of aboutPages) {
    const html = await readIfBuilt(`_site/${page}/index.html`);
    const linked = home.includes(`href="/the-idea-keep/${page}/"`);
    if (html === undefined) {
      assert(!linked, `The footer links to the unpublished /${page}/`);
      continue;
    }
    assert(
      !html.includes("TODO"),
      `Placeholder left in /${page}/: fill in ${page}.md before publishing`,
    );
    assert(linked, `The footer does not link to the published /${page}/`);
  }
});
