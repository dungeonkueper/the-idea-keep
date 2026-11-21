import { Expires } from "mppx";
import { Mppx, type Store, tempo } from "mppx/server";
import { createClient, http } from "viem";
import { tempoModerato } from "viem/chains";
import { testSupport } from "../../support_metadata.ts";

export const route = "/support/feed-the-imps";
export const rpcUrl = "https://rpc.moderato.tempo.xyz";
export type Env = { MPP_SECRET_KEY: string; TESTNET_RECIPIENT: string };

export function routeError(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (url.pathname !== route || url.search) {
    return new Response("Not found", { status: 404 });
  }
  if (request.method !== "POST") {
    return new Response("Use POST for voluntary testnet support", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }
  if ((request.headers.get("Authorization")?.length ?? 0) > 16384) {
    return new Response("Credential too large", { status: 431 });
  }
  return undefined;
}

export function createHandler(env: Env, store: Store.AtomicStore) {
  if (!/^[a-f0-9]{64}$/i.test(env.MPP_SECRET_KEY ?? "")) {
    throw new Error("Configure a random 32-byte MPP_SECRET_KEY");
  }
  if (
    !/^0x[0-9a-f]{40}$/i.test(env.TESTNET_RECIPIENT ?? "") ||
    /^0x0{40}$/.test(env.TESTNET_RECIPIENT)
  ) {
    throw new Error("Configure TESTNET_RECIPIENT");
  }
  const client = createClient({
    chain: tempoModerato,
    transport: http(rpcUrl),
  });
  const mppx = Mppx.create({
    secretKey: env.MPP_SECRET_KEY,
    realm: "feed-the-imps-testnet",
    methods: [tempo.charge({
      testnet: true,
      store,
      waitForConfirmation: true,
      getClient: ({ chainId }) => {
        if (chainId !== testSupport.chainId) throw new Error("Testnet only");
        return client;
      },
    })],
  });
  return async (request: Request): Promise<Response> => {
    const invalid = routeError(request);
    if (invalid) return invalid;
    try {
      // Workers may expose an empty POST as a stream; check actual bytes.
      const reader = request.body?.getReader();
      if (reader) {
        const first = await reader.read();
        await reader.cancel();
        if (!first.done) {
          return new Response("Send an empty body", { status: 400 });
        }
        request = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          signal: request.signal,
        });
      }
      const payment = await mppx.charge({
        amount: testSupport.suggestedAmount,
        currency: testSupport.currency,
        decimals: 6,
        chainId: testSupport.chainId,
        recipient: env.TESTNET_RECIPIENT as `0x${string}`,
        description:
          "Voluntary testnet support for feed-the-imps; content stays free.",
        expires: Expires.minutes(5),
      })(request);
      const response = payment.status === 402
        ? payment.challenge
        : payment.withReceipt(Response.json({
          message: "An imp has been fed. 😈",
          egg: "feed-the-imps",
          network: testSupport.network,
          contentRemainsFree: true,
        }));
      response.headers.set("Cache-Control", "no-store");
      return response;
    } catch {
      // Do not expose SDK/RPC errors: they can contain signed transactions.
      return Response.json({
        error: "Testnet support unavailable; content remains free.",
      }, {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }
  };
}
