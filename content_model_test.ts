import {
  assertUniqueChambers,
  assertUniqueContentUrls,
  contentUrl,
  markdownRepresentation,
  maxChamber,
  tidingMarkdownRepresentation,
  tidingMarkdownUrl,
  tidingUrl,
  toRomanNumeral,
  validateContentMetadata,
  validateTidingBody,
  validateTidingMetadata,
} from "./content_model.ts";

function validMetadata(overrides: Record<string, unknown> = {}) {
  return {
    title: "A valid entry",
    slug: "a-valid-entry",
    chamber: 1,
    summary: "A concise summary.",
    date: "2026-09-20",
    kind: "idea",
    maturity: "seed",
    publicationStatus: "published",
    ...overrides,
  };
}

function expectError(callback: () => void, expectedMessage: string) {
  try {
    callback();
  } catch (error) {
    if (error instanceof Error && error.message.includes(expectedMessage)) {
      return;
    }

    throw error;
  }

  throw new Error(`Expected an error containing '${expectedMessage}'.`);
}

Deno.test("validates date-only ISO calendar dates in UTC", () => {
  const metadata = validateContentMetadata(validMetadata(), "entry.md");

  if (metadata.date.toISOString() !== "2026-09-20T00:00:00.000Z") {
    throw new Error("Expected the date to remain at UTC midnight.");
  }
});

Deno.test("rejects non-ISO and impossible dates", () => {
  expectError(
    () =>
      validateContentMetadata(
        validMetadata({ date: "09/20/2026" }),
        "entry.md",
      ),
    "date",
  );
  expectError(
    () =>
      validateContentMetadata(
        validMetadata({ date: "2026-02-30" }),
        "entry.md",
      ),
    "date",
  );
  expectError(
    () =>
      validateContentMetadata(
        validMetadata({ date: new Date("2026-09-20T12:00:00.000Z") }),
        "entry.md",
      ),
    "date",
  );
});

Deno.test("derives unique public URLs from kind and slug", () => {
  const idea = validateContentMetadata(validMetadata(), "idea.md");
  const experiment = validateContentMetadata(
    validMetadata({ kind: "experiment" }),
    "experiment.md",
  );

  if (contentUrl(idea.kind, idea.slug) !== "/ideas/a-valid-entry/") {
    throw new Error("Expected the idea URL.");
  }

  assertUniqueContentUrls([
    { metadata: idea, source: "idea.md" },
    { metadata: experiment, source: "experiment.md" },
  ]);
});

Deno.test("rejects duplicate public URLs", () => {
  const first = validateContentMetadata(validMetadata(), "first.md");
  const second = validateContentMetadata(validMetadata(), "second.md");

  expectError(
    () =>
      assertUniqueContentUrls([
        { metadata: first, source: "first.md" },
        { metadata: second, source: "second.md" },
      ]),
    "duplicates first.md",
  );
});

Deno.test("accepts whole chamber numbers up to the Roman limit", () => {
  for (const chamber of [1, 42, maxChamber]) {
    const metadata = validateContentMetadata(
      validMetadata({ chamber }),
      "entry.md",
    );

    if (metadata.chamber !== chamber) {
      throw new Error(`Expected chamber ${chamber}.`);
    }
  }
});

Deno.test("rejects missing and invalid chamber numbers", () => {
  const { chamber: _chamber, ...withoutChamber } = validMetadata();

  expectError(
    () => validateContentMetadata(withoutChamber, "entry.md"),
    "entry.md: 'chamber' must be a whole number from 1 to 3999.",
  );

  for (
    const chamber of [0, -3, 1.5, "6", Number.NaN, null, maxChamber + 1]
  ) {
    expectError(
      () => validateContentMetadata(validMetadata({ chamber }), "entry.md"),
      "'chamber' must be a whole number from 1 to 3999.",
    );
  }
});

Deno.test("rejects duplicate chambers across kinds and drafts", () => {
  const published = validateContentMetadata(
    validMetadata({ chamber: 6 }),
    "published.md",
  );
  const draft = validateContentMetadata(
    validMetadata({
      chamber: 6,
      kind: "experiment",
      slug: "a-draft",
      publicationStatus: "draft",
    }),
    "draft.md",
  );
  const other = validateContentMetadata(
    validMetadata({ chamber: 7, slug: "another" }),
    "other.md",
  );

  assertUniqueChambers([
    { metadata: published, source: "published.md" },
    { metadata: other, source: "other.md" },
  ]);
  expectError(
    () =>
      assertUniqueChambers([
        { metadata: published, source: "published.md" },
        { metadata: draft, source: "draft.md" },
      ]),
    "draft.md: chamber 6 duplicates published.md.",
  );
});

Deno.test("converts chamber numbers to Roman numerals", () => {
  const cases: [number, string][] = [
    [1, "I"],
    [4, "IV"],
    [9, "IX"],
    [14, "XIV"],
    [40, "XL"],
    [90, "XC"],
    [400, "CD"],
    [1994, "MCMXCIV"],
    [3999, "MMMCMXCIX"],
  ];

  for (const [value, expected] of cases) {
    const actual = toRomanNumeral(value);

    if (actual !== expected) {
      throw new Error(`Expected ${value} as ${expected}, got ${actual}.`);
    }
  }

  for (const value of [0, 4000, 2.5]) {
    expectError(() => toRomanNumeral(value), "1 to 3999");
  }
});

Deno.test("lists the arabic chamber number in Markdown metadata", () => {
  const metadata = validateContentMetadata(
    validMetadata({ chamber: 6 }),
    "entry.md",
  );
  const markdown = markdownRepresentation(
    metadata,
    "Body",
    "https://example.test/ideas/a-valid-entry/",
  );

  if (!markdown.includes("\nChamber: 6\n")) {
    throw new Error("Expected a 'Chamber: 6' metadata line.");
  }
});

function validTiding(overrides: Record<string, unknown> = {}) {
  return {
    wing: "tidings",
    title: "A breach at the gate",
    slug: "2026-11-gate-breach",
    summary: "What is known about the breach, and a view from below.",
    first: "2026-11-09",
    updated: "2026-11-23",
    tags: ["security"],
    publicationStatus: "draft",
    ...overrides,
  };
}

const validTidingBody = `_A raven landed with soot on its wings._

## 2026-11-09
### Tidings
The vendor confirms X; researchers report Y. As of 2026-11-09.
### A View from Below
Short, but present.

## 2026-11-23 – Later tidings
### Tidings
A patch was released.
### A View from Below
My view changed.
`;

Deno.test("tidings stand outside the chambers on their own routes", () => {
  const metadata = validateTidingMetadata(validTiding(), "tiding.md");

  if (
    metadata.first.toISOString() !== "2026-11-09T00:00:00.000Z" ||
    metadata.tags.join() !== "security" ||
    tidingUrl(metadata.slug) !== "/tidings/2026-11-gate-breach/" ||
    tidingMarkdownUrl(metadata.slug) !== "/tidings/2026-11-gate-breach.md"
  ) {
    throw new Error("Unexpected tiding metadata or routes.");
  }

  for (const field of ["chamber", "kind", "maturity"]) {
    expectError(
      () => validateTidingMetadata(validTiding({ [field]: 8 }), "tiding.md"),
      `no '${field}'`,
    );
  }
  expectError(
    () => validateTidingMetadata(validTiding({ wing: "hatchery" }), "t.md"),
    "'wing'",
  );
});

Deno.test("tiding slugs carry the month of first engagement", () => {
  expectError(
    () => validateTidingMetadata(validTiding({ slug: "gate-breach" }), "t.md"),
    "<YYYY-MM>-<short-topic>",
  );
  expectError(
    () =>
      validateTidingMetadata(
        validTiding({ slug: "2026-10-gate-breach" }),
        "t.md",
      ),
    "month of 'first'",
  );
  expectError(
    () =>
      validateTidingMetadata(validTiding({ updated: "2026-11-01" }), "t.md"),
    "earlier than 'first'",
  );
  expectError(
    () => validateTidingMetadata(validTiding({ tags: "security" }), "t.md"),
    "'tags'",
  );
});

Deno.test("every tiding revision keeps facts and view, oldest first", () => {
  const metadata = validateTidingMetadata(validTiding(), "t.md");
  validateTidingBody(metadata, validTidingBody, "t.md");

  const cases: [string, string][] = [
    ["Just prose.", "at least one dated revision"],
    [
      validTidingBody.replace("## 2026-11-23 – Later tidings", "## Update"),
      "'## YYYY-MM-DD'",
    ],
    [
      validTidingBody.replace("## 2026-11-09", "## 2026-11-10"),
      "dated 'first'",
    ],
    [
      validTidingBody.replace("## 2026-11-23", "## 2026-11-22"),
      "dated 'updated'",
    ],
    [
      validTidingBody.replace("### A View from Below\nShort", "Short"),
      "followed by",
    ],
    [
      validTidingBody.replace("Short, but present.", ""),
      "empty 'A View from Below'",
    ],
    [
      validTidingBody.replace("The vendor", "### Tidings\nThe vendor"),
      "exactly",
    ],
    [`# Title\n\n${validTidingBody}`, "no '#' heading"],
  ];

  for (const [body, message] of cases) {
    expectError(() => validateTidingBody(metadata, body, "t.md"), message);
  }

  const outOfOrder = validTidingBody.replace(
    "## 2026-11-23",
    "## 2026-11-05\n### Tidings\nLate.\n### A View from Below\nLate.\n\n## 2026-11-23",
  );
  expectError(
    () => validateTidingBody(metadata, outOfOrder, "t.md"),
    "must be later than",
  );
  validateTidingBody(
    metadata,
    validTidingBody.replace(
      "A patch was released.",
      "```\n## not a revision\n### nor a part\n```",
    ),
    "t.md",
  );
});

Deno.test("tiding Markdown names wing and revision dates, not a chamber", () => {
  const metadata = validateTidingMetadata(validTiding(), "t.md");
  const markdown = tidingMarkdownRepresentation(
    metadata,
    validTidingBody,
    "https://example.test/tidings/2026-11-gate-breach/",
  );

  for (
    const expected of [
      "# A breach at the gate\n\nWhat is known",
      "\nWing: tidings\nFirst: 2026-11-09\nUpdated: 2026-11-23\n",
      "\nTags: security\n",
    ]
  ) {
    if (!markdown.includes(expected)) throw new Error(`Missing: ${expected}`);
  }

  if (markdown.includes("Chamber") || !markdown.endsWith(validTidingBody)) {
    throw new Error("Unexpected tiding Markdown.");
  }
});
