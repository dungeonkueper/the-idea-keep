# Feed the Imps: isolated Testnet POC

The Egg stays free on GitHub Pages. Only an explicit `POST` to the separate
Worker's `/support/feed-the-imps` starts an MPP charge. This implementation is
fixed to **Tempo Moderato (chain 42431), 0.01 test pathUSD**, token
`0x20c0000000000000000000000000000000000000` (6 decimals). It has no mainnet
switch, production wallet, fee sponsorship, or content proxy.

## Decisions and configuration

- Optional `support` metadata uses the existing content validation and
  HTML/Markdown publication boundary. This is a Keep convention, not
  standardized MPP discovery.
- The site advertises an **absolute** Worker URL. GitHub Pages cannot route a
  relative `/support/*` URL to Cloudflare. No DNS change is required.
- `MPP_SECRET_KEY`: random 32-byte hex **Worker secret**, signs challenges. It
  is not a wallet private key. `TESTNET_RECIPIENT`: public, nonzero receiver
  address. No recipient private key is needed to accept transfers.
- One SQLite Durable Object provides atomic, persistent replay claims across
  Worker instances. Claims expire with their five-minute challenge and expired
  rows are removed on the next atomic update. Idle expired rows remain until
  another update or removal of the object. No credentials are stored.
- The client creates a disposable key in memory and funds it from the public
  Moderato faucet. It reads no existing wallet, prints no key, and makes at most
  one payment per explicit `--pay-testnet` invocation. Leftover tokens are test
  funds only. It rejects other chains, amounts, assets, recipients, and splits.
- Client output records a cooperating visit, metadata discovery, challenge,
  confirmed payment, replay rejection, and unchanged content. It does not
  measure all site visitors. No server payment logs, public counters, or revenue
  estimates are added. A receipt is checked against its confirmed on-chain
  transfer.

## Run locally

Use Deno 2.9.7. From this directory:

```sh
deno task bootstrap
deno task setup
deno task check
deno task bundle
deno task dev
```

Setup creates ignored `.dev.vars` with a random challenge secret and a
disposable test recipient. It refuses to overwrite an existing file. Copy the
**public recipient address** printed by setup for the next terminal. Do not copy
secrets into source files or command arguments. Wrangler listens on port 8787.

In a second terminal, from the repository root (PowerShell):

```powershell
$env:FEED_IMPS_SUPPORT_ENDPOINT = 'http://127.0.0.1:8787/support/feed-the-imps'
$env:FEED_IMPS_SUPPORT_RECIPIENT = '<public address printed by setup>'
deno task serve
```

These two public settings advertise support only for this Egg. Both must be set,
or both absent. Normal builds with neither setting advertise no endpoint. The
site does not import MPP or contact the Worker. The whole `experiments/`
directory is excluded from the public site.

In a third terminal, from this directory:

```sh
# Read and discover; makes no support request and spends nothing.
deno task client http://localhost:3000/ideas/feed-the-imps/

# Explicitly authorize one fresh-wallet Testnet payment.
deno task client http://localhost:3000/ideas/feed-the-imps.md --pay-testnet
```

The HTML has a designated `application/json` block with ID `optional-support`.
Markdown has a `Support: {"support": ...}` metadata line. Prose examples are
never treated as live offers. Both representations expose the same object:

```json
{
  "support": {
    "optional": true,
    "protocol": "mpp",
    "network": "tempo-moderato",
    "chainId": 42431,
    "currency": "0x20c0000000000000000000000000000000000000",
    "suggestedAmount": "0.01",
    "endpoint": "http://127.0.0.1:8787/support/feed-the-imps",
    "recipient": "<configured public test address>"
  }
}
```

The payment run checks free HTTP 200 access, sends an empty POST, validates the
402 challenge against the discovered terms, funds the ephemeral payer, submits
one transfer, retries with its MPP credential, and verifies the
`Payment-Receipt` against the exact sender/recipient/token/amount in the
confirmed transaction. It then retries that same credential to confirm replay
rejection, and reads the Egg again to confirm identical content (excluding only
Lume's injected live-reload script on loopback). Expected success: **An imp has
been fed. 😈**

If the faucet or RPC is unavailable, retry later explicitly. Never respond to a
lost receipt by automatically making another payment. Push mode may already have
submitted the transfer even if the Worker is unavailable. Credentials and raw
SDK errors must not be printed. CI uses offline protocol tests, not faucet
payments.

## Deploy later, independently

The POC has been tested locally against real Moderato; no Cloudflare account or
remote Worker was provisioned. SQLite Durable Objects are available on Workers
Free within its limits. Use that plan; no paid service is required.

For a remote trial, authenticate Wrangler with your own Cloudflare account, set
the public `TESTNET_RECIPIENT` in Wrangler's `vars`, and use
`deno run -A --frozen-lockfile npm:wrangler@4.136.3 secret put MPP_SECRET_KEY`
to enter a fresh secret interactively. Then run `deno task deploy`. No custom
routes or content proxy are configured; only the separate `workers.dev` endpoint
exists. Do not copy local `.dev.vars` into Git or enable request/header logging.

After testing the deployed endpoint, set GitHub repository variables
`FEED_IMPS_SUPPORT_ENDPOINT` (its full HTTPS support URL) and
`FEED_IMPS_SUPPORT_RECIPIENT`, then redeploy Pages. To remove the experiment,
clear both variables and rebuild Pages, then remove the Worker and its
associated Durable Object storage through Cloudflare. Content continues working
throughout.

## Verified APIs and dependencies (2026-09-26)

The separate lockfile pins mppx 0.11.0, viem 2.56.8, Wrangler 4.136.3, and MCP
SDK 1.30.0, all older than three days at adoption. The MCP SDK is an mppx
bundling peer; this application exposes no MCP server. Its Express/Hono/schema
packages, mppx's Stripe/schema packages, viem's cryptography packages, and
Wrangler's esbuild/workerd/Miniflare/sharp tooling explain the larger
installation graph. No lifecycle scripts are approved. The root website lockfile
is unchanged.

The source uses `Mppx.create`,
`tempo.charge({ testnet: true, store, getClient })`,
`mppx.charge(options)(request)` and `payment.withReceipt(response)` from the
installed server SDK. The client uses `preparePayment` with `polyfill: false`,
validates the challenge before `createCredential`, then checks the receipt.

- [Cloudflare MPP Worker integration](https://developers.cloudflare.com/agents/tools/payments/mpp/accept-payments/)
- [MPP server charge API](https://mpp.dev/sdk/typescript/server/Method.tempo.charge)
- [MPP client charge API](https://mpp.dev/sdk/typescript/client/Method.tempo.charge)
- [Receipt semantics](https://mpp.dev/protocol/receipts)
- [Tempo connection details](https://docs.tempo.xyz/quickstart/connection-details)
- [Durable Objects Free plan](https://developers.cloudflare.com/durable-objects/platform/pricing/)

Confirmed local Worker test transaction:
[`0xf99d9cff…cb80465`](https://explore.testnet.tempo.xyz/tx/0xf99d9cffa6647bc973d896a471ada720b2529da05f51ff135cdf9a1d7cb80465).
This proves Testnet interoperability, not willingness to spend real money or
production deployment readiness. Challenge/RPC failures never change content
access.
