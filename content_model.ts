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

export interface ContentMetadata {
  title: string;
  slug: string;
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

  const date = parseIsoDate(data.date, source);

  const themedMaturity = data.themedMaturity === undefined
    ? undefined
    : requiredString(data, "themedMaturity", source);

  return {
    title,
    slug,
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

function parseIsoDate(value: unknown, source: string): Date {
  if (value instanceof Date) {
    if (
      Number.isNaN(value.getTime()) ||
      value.getUTCHours() !== 0 ||
      value.getUTCMinutes() !== 0 ||
      value.getUTCSeconds() !== 0 ||
      value.getUTCMilliseconds() !== 0
    ) {
      throw new Error(
        `${source}: 'date' must be a valid ISO date (YYYY-MM-DD).`,
      );
    }

    return new Date(value.getTime());
  }

  if (typeof value !== "string") {
    throw new Error(`${source}: 'date' must be a valid ISO date (YYYY-MM-DD).`);
  }

  const match = isoDatePattern.exec(value);

  if (!match) {
    throw new Error(`${source}: 'date' must be a valid ISO date (YYYY-MM-DD).`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${source}: 'date' must be a valid ISO date (YYYY-MM-DD).`);
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
