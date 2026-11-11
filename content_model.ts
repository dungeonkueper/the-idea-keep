export const contentKinds = [
  "idea",
  "experiment",
  "learning",
  "project",
  "artifact",
] as const;

export const maturityLevels = [
  "seed",
  "testing",
  "working-theory",
  "validated",
  "discarded",
  "dormant",
] as const;

export const publicationStatuses = [
  "draft",
  "published",
  "archived",
] as const;

export type ContentKind = (typeof contentKinds)[number];
export type Maturity = (typeof maturityLevels)[number];
export type PublicationStatus = (typeof publicationStatuses)[number];

/** Largest chamber number that still has a standard Roman numeral. */
export const maxChamber = 3999;

export interface ContentMetadata {
  title: string;
  slug: string;
  /** Permanent number across all kinds, assigned once and never reused. */
  chamber: number;
  summary: string;
  date: Date;
  kind: ContentKind;
  maturity: Maturity;
  themedMaturity?: string;
  publicationStatus: PublicationStatus;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function requiredString(
  data: Record<string, unknown>,
  field: string,
  source: string,
): string {
  const value = data[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${source}: '${field}' must be a non-empty string.`);
  }

  return value.trim();
}

function enumValue<T extends string>(
  data: Record<string, unknown>,
  field: string,
  allowed: readonly T[],
  source: string,
): T {
  const value = requiredString(data, field, source);

  if (!allowed.includes(value as T)) {
    throw new Error(
      `${source}: '${field}' must be one of: ${allowed.join(", ")}.`,
    );
  }

  return value as T;
}

export function validateContentMetadata(
  data: Record<string, unknown>,
  source: string,
): ContentMetadata {
  const title = requiredString(data, "title", source);
  const slug = requiredString(data, "slug", source);
  const summary = requiredString(data, "summary", source);

  if (!slugPattern.test(slug)) {
    throw new Error(
      `${source}: 'slug' must contain lowercase letters, numbers, and single hyphens only.`,
    );
  }

  const chamber = data.chamber;

  if (
    typeof chamber !== "number" || !Number.isInteger(chamber) ||
    chamber < 1 || chamber > maxChamber
  ) {
    throw new Error(
      `${source}: 'chamber' must be a whole number from 1 to ${maxChamber}.`,
    );
  }

  const date = parseIsoDate(data.date, source);

  const themedMaturity = data.themedMaturity === undefined
    ? undefined
    : requiredString(data, "themedMaturity", source);

  return {
    title,
    slug,
    chamber,
    summary,
    date,
    kind: enumValue(data, "kind", contentKinds, source),
    maturity: enumValue(data, "maturity", maturityLevels, source),
    themedMaturity,
    publicationStatus: enumValue(
      data,
      "publicationStatus",
      publicationStatuses,
      source,
    ),
  };
}

function parseIsoDate(
  value: unknown,
  source: string,
  field = "date",
): Date {
  if (value instanceof Date) {
    if (
      Number.isNaN(value.getTime()) ||
      value.getUTCHours() !== 0 ||
      value.getUTCMinutes() !== 0 ||
      value.getUTCSeconds() !== 0 ||
      value.getUTCMilliseconds() !== 0
    ) {
      throw new Error(
        `${source}: '${field}' must be a valid ISO date (YYYY-MM-DD).`,
      );
    }

    return new Date(value.getTime());
  }

  if (typeof value !== "string") {
    throw new Error(
      `${source}: '${field}' must be a valid ISO date (YYYY-MM-DD).`,
    );
  }

  const match = isoDatePattern.exec(value);

  if (!match) {
    throw new Error(
      `${source}: '${field}' must be a valid ISO date (YYYY-MM-DD).`,
    );
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (date.toISOString().slice(0, 10) !== value) {
    throw new Error(
      `${source}: '${field}' must be a valid ISO date (YYYY-MM-DD).`,
    );
  }

  return date;
}

export function contentUrl(kind: ContentKind, slug: string): string {
  const sections: Record<ContentKind, string> = {
    idea: "ideas",
    experiment: "experiments",
    learning: "learnings",
    project: "projects",
    artifact: "artifacts",
  };

  return `/${sections[kind]}/${slug}/`;
}

export function assertUniqueContentUrls(
  entries: Iterable<{ metadata: ContentMetadata; source: string }>,
): void {
  const sourcesByUrl = new Map<string, string>();

  for (const { metadata, source } of entries) {
    const url = contentUrl(metadata.kind, metadata.slug);
    const existingSource = sourcesByUrl.get(url);

    if (existingSource) {
      throw new Error(
        `${source}: public URL '${url}' duplicates ${existingSource}.`,
      );
    }

    sourcesByUrl.set(url, source);
  }
}

/** Check every record, drafts included, so a number is never reused. */
export function assertUniqueChambers(
  entries: Iterable<{ metadata: ContentMetadata; source: string }>,
): void {
  const sourcesByChamber = new Map<number, string>();

  for (const { metadata, source } of entries) {
    const existingSource = sourcesByChamber.get(metadata.chamber);

    if (existingSource) {
      throw new Error(
        `${source}: chamber ${metadata.chamber} duplicates ${existingSource}.`,
      );
    }

    sourcesByChamber.set(metadata.chamber, source);
  }
}

const romanNumerals: readonly [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function toRomanNumeral(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > maxChamber) {
    throw new RangeError(
      `Roman numerals cover whole numbers from 1 to ${maxChamber}, not ${value}.`,
    );
  }

  let remainder = value;
  let numeral = "";

  for (const [amount, symbol] of romanNumerals) {
    while (remainder >= amount) {
      numeral += symbol;
      remainder -= amount;
    }
  }

  return numeral;
}

/** Keep the published Markdown next to the existing HTML resource. */
export function markdownUrl(kind: ContentKind, slug: string): string {
  return `${contentUrl(kind, slug).slice(0, -1)}.md`;
}

export function markdownRepresentation(
  metadata: ContentMetadata,
  body: string,
  canonicalUrl: string,
): string {
  return [
    `# ${metadata.title}`,
    metadata.summary,
    `Canonical: <${canonicalUrl}>\n` +
    `Chamber: ${metadata.chamber}\n` +
    `Date: ${metadata.date.toISOString().slice(0, 10)}\n` +
    `Kind: ${metadata.kind}\n` +
    `Maturity: ${metadata.maturity}\n` +
    (metadata.themedMaturity
      ? `Themed maturity: ${metadata.themedMaturity}\n`
      : "") +
    `Publication status: ${metadata.publicationStatus}`,
    body,
  ].join("\n\n");
}

/**
 * Tidings live in their own wing outside the chambers. They carry no chamber
 * number, kind, or maturity; their identity is the slug fixed at first writing.
 */
export const tidingsWing = "tidings";

export interface TidingMetadata {
  wing: typeof tidingsWing;
  title: string;
  /** `<YYYY-MM>-<short-topic>`, the month of `first`. Never changed. */
  slug: string;
  summary: string;
  /** When the event first seriously occupied the author. */
  first: Date;
  /** Date of the latest revision block. */
  updated: Date;
  tags: string[];
  publicationStatus: PublicationStatus;
}

const tidingSlugPattern = /^(\d{4}-\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const tagPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateTidingMetadata(
  data: Record<string, unknown>,
  source: string,
): TidingMetadata {
  if (data.wing !== tidingsWing) {
    throw new Error(`${source}: 'wing' must be '${tidingsWing}'.`);
  }

  for (const field of ["chamber", "kind", "maturity"]) {
    if (data[field] !== undefined) {
      throw new Error(
        `${source}: tidings stand outside the chambers and take no '${field}'.`,
      );
    }
  }

  const title = requiredString(data, "title", source);
  const slug = requiredString(data, "slug", source);
  const summary = requiredString(data, "summary", source);
  const first = parseIsoDate(data.first, source, "first");
  const updated = parseIsoDate(data.updated, source, "updated");
  const slugMatch = tidingSlugPattern.exec(slug);

  if (!slugMatch) {
    throw new Error(
      `${source}: 'slug' must be '<YYYY-MM>-<short-topic>' in lowercase kebab case.`,
    );
  }

  if (slugMatch[1] !== first.toISOString().slice(0, 7)) {
    throw new Error(
      `${source}: 'slug' must start with the month of 'first' (${
        first.toISOString().slice(0, 7)
      }).`,
    );
  }

  if (updated < first) {
    throw new Error(`${source}: 'updated' must not be earlier than 'first'.`);
  }

  const rawTags = data.tags ?? [];

  if (
    !Array.isArray(rawTags) ||
    !rawTags.every((tag) => typeof tag === "string" && tagPattern.test(tag))
  ) {
    throw new Error(
      `${source}: 'tags' must be a list of lowercase kebab-case words.`,
    );
  }

  return {
    wing: tidingsWing,
    title,
    slug,
    summary,
    first,
    updated,
    tags: [...rawTags],
    publicationStatus: enumValue(
      data,
      "publicationStatus",
      publicationStatuses,
      source,
    ),
  };
}

const revisionHeadingPattern = /^## (\d{4}-\d{2}-\d{2})(?:\s+[–-]\s+\S.*)?$/;
const tidingsHeading = "### Tidings";
const viewHeading = "### A View from Below";

/**
 * Enforce the wing's structure: one or more dated revision blocks, each with
 * non-empty "Tidings" and "A View from Below" parts in that order. The first
 * block is dated `first`, the last `updated`, and dates strictly increase.
 * Append-only history is a review rule; the build cannot see earlier versions.
 */
export function validateTidingBody(
  metadata: TidingMetadata,
  body: string,
  source: string,
): void {
  const revisions: { date: string; lines: string[] }[] = [];
  let inFence = false;

  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    if (/^(```|~~~)/.test(line)) inFence = !inFence;

    if (!inFence && /^# /.test(line)) {
      throw new Error(
        `${source}: the title comes from frontmatter; use no '#' heading in the body.`,
      );
    }

    if (!inFence && /^## /.test(line)) {
      const match = revisionHeadingPattern.exec(line.trimEnd());

      if (!match) {
        throw new Error(
          `${source}: revision heading '${line}' must be '## YYYY-MM-DD' with an optional ' – label'.`,
        );
      }

      parseIsoDate(match[1], source, "revision heading");
      revisions.push({ date: match[1], lines: [] });
      continue;
    }

    revisions.at(-1)?.lines.push(inFence ? "" : line);
  }

  if (revisions.length === 0) {
    throw new Error(`${source}: a tiding needs at least one dated revision.`);
  }

  const firstDate = metadata.first.toISOString().slice(0, 10);
  const updatedDate = metadata.updated.toISOString().slice(0, 10);

  if (revisions[0].date !== firstDate) {
    throw new Error(
      `${source}: the first revision must be dated 'first' (${firstDate}).`,
    );
  }

  if (revisions.at(-1)!.date !== updatedDate) {
    throw new Error(
      `${source}: the latest revision must be dated 'updated' (${updatedDate}).`,
    );
  }

  revisions.forEach(({ date, lines }, index) => {
    if (index > 0 && date <= revisions[index - 1].date) {
      throw new Error(
        `${source}: revision ${date} must be later than ${
          revisions[index - 1].date
        }; append new revisions at the end.`,
      );
    }

    const third = lines
      .map((line, position) => ({ line: line.trimEnd(), position }))
      .filter(({ line }) => /^### /.test(line));
    const names = third.map(({ line }) => line);

    if (
      names.length !== 2 || names[0] !== tidingsHeading ||
      names[1] !== viewHeading
    ) {
      throw new Error(
        `${source}: revision ${date} must contain exactly '${tidingsHeading}' followed by '${viewHeading}'.`,
      );
    }

    const facts = lines.slice(third[0].position + 1, third[1].position);
    const view = lines.slice(third[1].position + 1);

    for (
      const [part, text] of [["Tidings", facts], [
        "A View from Below",
        view,
      ]] as const
    ) {
      if (text.join("").trim().length === 0) {
        throw new Error(`${source}: revision ${date} has an empty '${part}'.`);
      }
    }
  });
}

export function tidingUrl(slug: string): string {
  return `/${tidingsWing}/${slug}/`;
}

export function tidingMarkdownUrl(slug: string): string {
  return `/${tidingsWing}/${slug}.md`;
}

export function tidingMarkdownRepresentation(
  metadata: TidingMetadata,
  body: string,
  canonicalUrl: string,
): string {
  return [
    `# ${metadata.title}`,
    metadata.summary,
    `Canonical: <${canonicalUrl}>\n` +
    `Wing: ${metadata.wing}\n` +
    `First: ${metadata.first.toISOString().slice(0, 10)}\n` +
    `Updated: ${metadata.updated.toISOString().slice(0, 10)}\n` +
    (metadata.tags.length ? `Tags: ${metadata.tags.join(", ")}\n` : "") +
    `Publication status: ${metadata.publicationStatus}`,
    body,
  ].join("\n\n");
}
