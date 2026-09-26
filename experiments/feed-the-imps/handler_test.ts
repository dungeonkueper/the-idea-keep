import { Challenge, Credential } from "mppx";
import { Store } from "mppx/server";
import { createHandler, route } from "./handler.ts";
import { discover, stableContent, validateOffer } from "./client.ts";
import { supportJson, testSupport } from "../../support_metadata.ts";

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
const endpoint = `http://localhost:8787${route}`;
const recipient = "0x1111111111111111111111111111111111111111";
const env = { MPP_SECRET_KEY: "12".repeat(32), TESTNET_RECIPIENT: recipient };
const support = { ...testSupport, recipient, endpoint } as const;

Deno.test("local comparison ignores only the injected reload script", () => {
  const first =
    '<article>Free Egg</article><script type="module" id="lume-live-reload">reload(1)</script>';
  const second = first.replace("reload(1)", "reload(2)");
  assert(
    stableContent(first, true) === stableContent(second, true),
    "Dev script affected comparison",
  );
  assert(
    stableContent(first, false) !== stableContent(second, false),
    "Remote script change hidden",
  );
  assert(
    stableContent(first, true) !==
      stableContent(second.replace("Free Egg", "Changed Egg"), true),
    "Article change hidden",
  );
});

Deno.test("only an empty POST to this Egg can issue a challenge", async () => {
  const handle = createHandler(env, Store.memory());
  for (
    const [url, init, expected] of [
      [endpoint, {}, 405],
      [
        endpoint.replace(route, "/ideas/feed-the-imps/"),
        { method: "POST" },
        404,
      ],
      [endpoint + "?amount=999", { method: "POST" }, 404],
      [endpoint, { method: "POST", body: "untrusted" }, 400],
    ] as const
  ) {
    const response = await handle(new Request(url, init));
    assert(
      response.status === expected,
      "Route or method accepted unexpectedly",
    );
    assert(
      !response.headers.has("Payment-Receipt"),
      "Invalid request received a receipt",
    );
    await response.body?.cancel();
  }
  const response = await handle(new Request(endpoint, { method: "POST" }));
  assert(response.status === 402, "Expected 402");
  assert(
    response.headers.get("Cache-Control") === "no-store",
    "Payment response cached",
  );
  const challenge = Challenge.fromResponse(response);
  validateOffer(challenge, support);
  assert(
    Challenge.verify(challenge, { secretKey: env.MPP_SECRET_KEY }),
    "Challenge HMAC invalid",
  );
  assert(Date.parse(challenge.expires!) > Date.now(), "Challenge expired");
  assert(
    Date.parse(challenge.expires!) <= Date.now() + 301_000,
    "Challenge too long-lived",
  );
  await response.body?.cancel();
});

Deno.test("tampered terms and malformed credentials never get success or receipts", async () => {
  const handle = createHandler(env, Store.memory());
  const response = await handle(new Request(endpoint, { method: "POST" }));
  const challenge = Challenge.fromResponse(response);
  await response.body?.cancel();
  const tampered = Credential.serialize({
    challenge: { ...challenge, request: { ...challenge.request, amount: "1" } },
    payload: { type: "hash", hash: "0x" + "00".repeat(32) },
  });
  for (const authorization of ["Payment garbage", tampered]) {
    const rejected = await handle(
      new Request(endpoint, {
        method: "POST",
        headers: { Authorization: authorization },
      }),
    );
    assert(rejected.status === 402, "Invalid credential was not rejected");
    assert(
      !rejected.headers.has("Payment-Receipt"),
      "Invalid credential got receipt",
    );
    await rejected.body?.cancel();
  }
});

Deno.test("client discovers only designated metadata and rejects changed payment terms", async () => {
  assert(
    discover('```json\n{"support":{}}\n```') === undefined,
    "Prose example treated as offer",
  );
  assert(
    discover(`Support: ${supportJson(support)}`)?.endpoint === endpoint,
    "Markdown discovery failed",
  );
  assert(
    discover(
      `<script type="application/json" id="optional-support">${
        supportJson(support)
      }</script>`,
    )?.endpoint === endpoint,
    "HTML discovery failed",
  );
  const response = await createHandler(env, Store.memory())(
    new Request(endpoint, { method: "POST" }),
  );
  const challenge = Challenge.fromResponse(response);
  await response.body?.cancel();
  for (
    const request of [
      { ...challenge.request, amount: "1000000" },
      { ...challenge.request, currency: "0x" + "11".repeat(20) },
      { ...challenge.request, recipient: "0x" + "22".repeat(20) },
      { ...challenge.request, methodDetails: { chainId: 4217 } },
      { ...challenge.request, methodDetails: { chainId: 42431, splits: [] } },
    ]
  ) {
    let rejected = false;
    try {
      validateOffer({ ...challenge, request }, support);
    } catch {
      rejected = true;
    }
    assert(rejected, "Client accepted unexpected spend terms");
  }
});
