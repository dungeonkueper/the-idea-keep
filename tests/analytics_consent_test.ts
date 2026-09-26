import { strict as assert } from "node:assert";
import { runInNewContext } from "node:vm";

const code = Deno.readTextFileSync("analytics-consent.js");
const key = "the-idea-keep:analytics-consent:v1";
function page(saved: string | null = null, blocked = false, hash = "") {
  const elements = new Map();
  const events = new Map();
  const scripts: { src: string; dataset: Record<string, string> }[] = [];
  const navigation: string[] = [];
  let storage = saved;
  const element = (id: string) => {
    if (!elements.has(id)) {
      elements.set(id, {
        hidden: true,
        textContent: "",
        focus() {},
        addEventListener(type: string, fn: () => void) {
          this[type] = fn;
        },
      });
    }
    return elements.get(id);
  };
  runInNewContext(code, {
    document: {
      currentScript: { dataset: { analyticsToken: "test-token" } },
      getElementById: element,
      createElement: () => ({ dataset: {} }),
      head: {
        append: (script: typeof scripts[number]) => scripts.push(script),
      },
    },
    localStorage: {
      getItem: () => {
        if (blocked) throw Error("blocked");
        return storage;
      },
      setItem: (_key: string, value: string) => {
        if (blocked) throw Error("blocked");
        storage = value;
      },
    },
    location: {
      hash,
      pathname: "/the-idea-keep/",
      search: "",
      replace: (url: string) => navigation.push(url),
      reload: () => navigation.push("reload"),
    },
    history: { replaceState() {} },
    addEventListener: (name: string, fn: (event: unknown) => void) =>
      events.set(name, fn),
    setTimeout: () => 1,
    clearTimeout() {},
  });
  return {
    scripts,
    navigation,
    element,
    events,
    stored: () => storage,
    changeStorage: (value: string | null) => {
      storage = value;
    },
  };
}
const saved = (choice: string, expires = Date.now() + 60000) =>
  JSON.stringify({ choice, expires });

Deno.test("no consent, invalid or expired state never loads the beacon", () => {
  for (
    const value of [null, "broken", "{}", saved("accepted", 0), saved("other")]
  ) {
    const p = page(value);
    assert.equal(p.scripts.length, 0);
    assert.equal(p.element("analytics-consent").hidden, false);
  }
});
Deno.test("reject persists across pages without loading; reopening does not grant", () => {
  const p = page();
  p.element("analytics-reject").click();
  const next = page(p.stored());
  assert.equal(next.scripts.length, 0);
  assert.equal(next.element("analytics-consent").hidden, true);
  next.element("analytics-settings").click();
  assert.equal(next.element("analytics-consent").hidden, false);
  assert.equal(next.scripts.length, 0);
});
Deno.test("accept loads exactly once and restores on navigation", () => {
  const p = page();
  p.element("analytics-accept").click();
  p.element("analytics-accept").click();
  assert.equal(p.scripts.length, 1);
  assert.equal(JSON.parse(p.scripts[0].dataset.cfBeacon).token, "test-token");
  assert.equal(page(p.stored()).scripts.length, 1);
});
Deno.test("withdrawal persists rejection and reloads without the beacon", () => {
  const p = page(saved("accepted"));
  p.element("analytics-reject").click();
  assert.equal(JSON.parse(p.stored()!).choice, "rejected");
  assert.deepEqual(p.navigation, [
    "/the-idea-keep/#analytics-disabled",
    "reload",
  ]);
  assert.equal(
    page(saved("accepted"), false, "#analytics-disabled").scripts.length,
    0,
  );
});
Deno.test("blocked storage defaults off but permits a page-local explicit choice", () => {
  const p = page(null, true);
  assert.equal(p.scripts.length, 0);
  p.element("analytics-accept").click();
  assert.equal(p.scripts.length, 1);
  p.element("analytics-reject").click();
  assert.equal(p.navigation.at(-1), "reload");
  assert.equal(page(null, true, "#analytics-disabled").scripts.length, 0);
});
Deno.test("cross-tab rejection and back-forward cache restoration revoke consent", () => {
  for (const event of ["storage", "pageshow"]) {
    const p = page(saved("accepted"));
    p.changeStorage(saved("rejected"));
    p.events.get(event)({ key, persisted: true });
    assert.equal(p.navigation.at(-1), "reload");
  }
});
