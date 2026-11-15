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
  const outputs = [
    ...legalPages.map((page) => `${page}/index.html`),
    "datenschutz.md",
  ];
  for (const output of outputs) {
    const text = await Deno.readTextFile(`_site/${output}`);
    assert(
      !text.includes("TODO"),
      `Placeholder left in /${output}: fill in _data/legal.yml`,
    );
  }
});

Deno.test("both legal pages show the operator's contact details directly", async () => {
  const contact = (text: string) =>
    text.match(/<address>[\s\S]*?<\/address>/)?.[0];
  const impressum = contact(
    await Deno.readTextFile("_site/impressum/index.html"),
  );
  assert(impressum, "Missing operator address: impressum");
  for (const output of ["datenschutz/index.html", "datenschutz.md"]) {
    const address = contact(await Deno.readTextFile(`_site/${output}`));
    assert(address, `Missing operator address: /${output}`);
    assert(address.includes("mailto:"), `Missing e-mail: /${output}`);
    // Same data source, so name, street and city must match the Impressum.
    for (const line of impressum.split("<br>").slice(0, 3)) {
      assert(
        address.includes(line.replace("<address>", "").trim()),
        `/${output} differs from the Impressum address`,
      );
    }
  }
  const markdown = await Deno.readTextFile("_site/datenschutz.md");
  assert(
    markdown.includes(
      "](https://dungeonkueper.github.io/the-idea-keep/impressum/)",
    ),
    "Markdown privacy notice needs an absolute Impressum link",
  );
  const html = await Deno.readTextFile("_site/datenschutz/index.html");
  assert(
    html.includes('href="/the-idea-keep/datenschutz.md"'),
    "Privacy notice does not advertise its Markdown alternate",
  );
});

Deno.test("the privacy notice mentions Cloudflare only when analytics is built in", async () => {
  const enabled = Boolean(
    Deno.env.get("CLOUDFLARE_WEB_ANALYTICS_TOKEN")?.trim(),
  );
  for (const output of ["datenschutz/index.html", "datenschutz.md"]) {
    const text = await Deno.readTextFile(`_site/${output}`);
    assert(
      text.includes("Cloudflare Web Analytics") === enabled,
      `/${output} must ${enabled ? "" : "not "}describe Cloudflare analytics`,
    );
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
