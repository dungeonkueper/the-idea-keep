import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// Disposable test recipient. Its private key is never persisted or printed.
const recipient = privateKeyToAccount(generatePrivateKey()).address;
const secret = [...crypto.getRandomValues(new Uint8Array(32))]
  .map((byte) => byte.toString(16).padStart(2, "0")).join("");
await Deno.writeTextFile(
  ".dev.vars",
  `MPP_SECRET_KEY=${secret}\nTESTNET_RECIPIENT=${recipient}\n`,
  { createNew: true, mode: 0o600 },
);
console.log(`Created ignored .dev.vars. Testnet recipient: ${recipient}`);
