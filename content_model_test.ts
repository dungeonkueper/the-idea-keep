import {
  assertUniqueContentUrls,
  contentUrl,
  validateContentMetadata,
} from "./content_model.ts";

function validMetadata(overrides: Record<string, unknown> = {}) {
  return {
    title: "A valid entry",
    slug: "a-valid-entry",
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
