function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const legalPages = ["impressum", "datenschutz"] as const;

async function* htmlFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

Deno.test("legal pages are built without placeholders", async () => {
  for (const page of legalPages) {
    const html = await Deno.readTextFile(`_site/${page}/index.html`);
    assert(
      !html.includes("TODO"),
      `Placeholder left on /${page}/: fill in _data/legal.yml`,
    );
    assert(html.includes("<address>"), `Missing operator address: ${page}`);
  }
});

Deno.test("every page links to the legal pages", async () => {
  let checked = 0;
  for await (const path of htmlFiles("_site")) {
    const html = await Deno.readTextFile(path);
    for (const page of legalPages) {
      assert(
        html.includes(`href="/the-idea-keep/${page}/"`),
        `${path} does not link to /${page}/`,
      );
    }
    checked++;
  }
  assert(checked > legalPages.length, "No content pages checked");
});
