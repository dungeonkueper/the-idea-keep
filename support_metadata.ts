/** Keep convention, not an MPP discovery standard. No payment SDK belongs here. */
export const testSupport = {
  optional: true,
  protocol: "mpp",
  network: "tempo-moderato",
  chainId: 42431,
  currency: "0x20c0000000000000000000000000000000000000",
  suggestedAmount: "0.01",
} as const;

export type SupportMetadata = typeof testSupport & {
  endpoint: string;
  recipient: `0x${string}`;
};

export function validateSupport(value: unknown, slug: string): SupportMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("support must be an object");
  }
  const data = value as Record<string, unknown>;
  for (const [key, expected] of Object.entries(testSupport)) {
    if (data[key] !== expected) {
      throw new Error(`Invalid testnet support.${key}`);
    }
  }
  const endpoint = new URL(String(data.endpoint));
  const local = endpoint.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);
  if (
    (!local && endpoint.protocol !== "https:") || endpoint.username ||
    endpoint.password || endpoint.search || endpoint.hash ||
    endpoint.pathname !== `/support/${slug}`
  ) {
    throw new Error(
      "support.endpoint must be an absolute HTTPS or loopback URL for this Egg",
    );
  }
  if (
    typeof data.recipient !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(data.recipient) ||
    /^0x0{40}$/.test(data.recipient)
  ) throw new Error("Invalid support.recipient");
  return {
    ...testSupport,
    endpoint: endpoint.href,
    recipient: data.recipient as `0x${string}`,
  };
}

export function supportJson(support: SupportMetadata): string {
  return JSON.stringify({ support }).replace(/</g, "\\u003c");
}
