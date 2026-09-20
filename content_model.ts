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

  const rawDate = data.date;
  const date = rawDate instanceof Date ? rawDate : new Date(String(rawDate));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${source}: 'date' must be a valid ISO date.`);
  }

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
