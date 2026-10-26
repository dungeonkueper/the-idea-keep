import { type Challenge, Receipt } from "mppx";
import { Mppx, tempo } from "mppx/client";
import { createClient, http, parseEventLogs } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getChainId, getTransactionReceipt } from "viem/actions";
import { tempoModerato } from "viem/chains";
import { Actions } from "viem/tempo";
import {
  type SupportMetadata,
  testSupport,
  validateSupport,
} from "../../support_metadata.ts";
import { rpcUrl } from "./handler.ts";

class FlowError extends Error {}

export function stableContent(body: string, local: boolean): string {
  // Lume increments its development reload script on unrelated file changes.
  // Ignore only that injected script on loopback, never article/metadata changes.
  return local
    ? body.replace(
      /<script type="module" id="lume-live-reload"[^>]*>[^]*?<\/script>/g,
      "",
    )
    : body;
}

export function discover(body: string): SupportMetadata | undefined {
  const json = body.match(/^Support: (\{.+\})$/m)?.[1] ??
    body.match(
      /<script type="application\/json" id="optional-support">([^]*?)<\/script>/,
    )?.[1];
  return json
    ? validateSupport(JSON.parse(json).support, "feed-the-imps")
    : undefined;
}

export function validateOffer(
  challenge: Challenge.Challenge,
  support: SupportMetadata,
) {
  const request = challenge.request as {
    amount?: string;
    currency?: string;
    recipient?: string;
    methodDetails?: { chainId?: number; splits?: unknown; feePayer?: unknown };
  };
  if (
    challenge.method !== "tempo" || challenge.intent !== "charge" ||
    request.amount !== "10000" ||
    request.currency?.toLowerCase() !== support.currency ||
    request.recipient?.toLowerCase() !== support.recipient.toLowerCase() ||
    request.methodDetails?.chainId !== testSupport.chainId ||
    request.methodDetails?.splits !== undefined ||
    request.methodDetails?.feePayer
  ) {
    throw new FlowError(
      "Offer differs from the permitted 0.01 pathUSD testnet payment",
    );
  }
}

async function readEgg(url: string) {
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" &&
    !(parsed.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(parsed.hostname))
  ) {
    throw new FlowError("Use HTTPS or loopback for the Egg URL");
  }
  const response = await fetch(url, { redirect: "error" });
  if (response.status !== 200) {
    throw new FlowError("Egg must be freely readable with HTTP 200");
  }
  return stableContent(
    await response.text(),
    ["localhost", "127.0.0.1"].includes(parsed.hostname),
  );
}

export async function run(eggUrl: string, payTestnet: boolean) {
  const before = await readEgg(eggUrl);
  console.log("egg_read: 200 (free)");
  const support = discover(before);
  if (!support) {
    console.log("support_metadata: absent; no payment attempted");
    return;
  }
  console.log("support_metadata: discovered (optional, Tempo Moderato)");
  if (!payTestnet) {
    console.log(
      "support_skipped: use --pay-testnet to authorize one faucet-funded test payment",
    );
    return;
  }
  // A fresh key exists only in this process. No wallet/environment key is read.
  const account = privateKeyToAccount(generatePrivateKey());
  const client = createClient({
    account,
    chain: tempoModerato.extend({ feeToken: testSupport.currency }),
    transport: http(rpcUrl),
  });
  if (await getChainId(client) !== testSupport.chainId) {
    throw new FlowError("RPC is not Moderato");
  }
  const mppx = Mppx.create({
    polyfill: false,
    methods: [tempo.charge({
      account,
      expectedChainId: testSupport.chainId,
      allowedChainIds: [testSupport.chainId],
      expectedRecipients: [support.recipient],
      mode: "push",
      getClient: () => client,
    })],
  });
  const init: RequestInit = { method: "POST", redirect: "error" };
  const challengeResponse = await fetch(support.endpoint, init);
  if (challengeResponse.status !== 402) {
    throw new FlowError("Expected HTTP 402");
  }
  console.log("challenge_received: 402");
  const payment = await mppx.preparePayment(challengeResponse, {
    request: init,
  });
  validateOffer(payment.challenge, support);
  await Actions.faucet.fundSync(client, { account, timeout: 60_000 });
  console.log("payer_funded: disposable testnet account");
  const credential = await payment.createCredential();
  const paidInit = payment.setCredential(init, credential);
  const response = await fetch(support.endpoint, paidInit);
  if (response.status !== 200) {
    throw new FlowError(
      "Payment not acknowledged; do not automatically pay again",
    );
  }
  const receipt = Receipt.deserialize(
    response.headers.get("Payment-Receipt") ?? "",
  );
  if (
    receipt.method !== "tempo" || receipt.status !== "success" ||
    !/^0x[0-9a-f]{64}$/i.test(receipt.reference)
  ) {
    throw new FlowError("Invalid payment receipt");
  }
  const onchain = await getTransactionReceipt(client, {
    hash: receipt.reference as `0x${string}`,
  });
  const transfers = parseEventLogs({
    abi: [{
      type: "event",
      name: "Transfer",
      inputs: [
        { name: "from", type: "address", indexed: true },
        { name: "to", type: "address", indexed: true },
        { name: "value", type: "uint256", indexed: false },
      ],
    }] as const,
    logs: onchain.logs,
  });
  if (
    onchain.status !== "success" ||
    !transfers.some((log) =>
      log.address.toLowerCase() === support.currency &&
      log.args.from.toLowerCase() === account.address.toLowerCase() &&
      log.args.to.toLowerCase() === support.recipient.toLowerCase() &&
      log.args.value === 10000n
    )
  ) {
    throw new FlowError(
      "Receipt does not reference the expected confirmed transfer",
    );
  }
  const replay = await fetch(support.endpoint, paidInit);
  if (replay.status !== 402 || replay.headers.has("Payment-Receipt")) {
    throw new FlowError("Replay was not rejected");
  }
  const after = await readEgg(eggUrl);
  if (after !== before) {
    throw new FlowError("Egg content changed during the experiment");
  }
  console.log(JSON.stringify({
    message: "An imp has been fed. 😈",
    receiptVerifiedOnchain: true,
    reference: receipt.reference,
    replayRejected: true,
    contentUnchanged: true,
    amount: "0.01",
    network: "tempo-moderato",
  }));
}

if (import.meta.main) {
  const url = Deno.args.find((arg) => !arg.startsWith("--"));
  if (
    !url ||
    Deno.args.some((arg) => arg.startsWith("--") && arg !== "--pay-testnet")
  ) {
    console.error(
      "Usage: deno task client <Egg HTML or Markdown URL> [--pay-testnet]",
    );
    Deno.exit(1);
  }
  try {
    await run(url, Deno.args.includes("--pay-testnet"));
  } catch (error) {
    // SDK errors can include signed transaction data. Never print them.
    console.error(
      "Test flow failed. Check endpoint configuration, testnet availability and faucet limits. No automatic second payment was attempted.",
    );
    console.error(
      `Failure category: ${
        error instanceof FlowError
          ? error.message
          : error instanceof Error
          ? error.name
          : "unknown"
      }`,
    );
    Deno.exit(1);
  }
}
