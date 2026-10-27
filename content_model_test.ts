import {
  assertUniqueChambers,
  assertUniqueContentUrls,
  contentUrl,
  markdownRepresentation,
  maxChamber,
  toRomanNumeral,
  validateContentMetadata,
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
