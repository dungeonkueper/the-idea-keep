import type { Store } from "mppx/server";
import { createHandler, type Env, routeError } from "./handler.ts";

// Structural subset of the Workers SQL API; no platform dependency in the core.
interface Sql {
  exec(
    query: string,
    ...bindings: (string | number)[]
  ): Iterable<Record<string, unknown>>;
}
interface State {
  storage: { sql: Sql; transactionSync<T>(fn: () => T): T };
}
interface WorkerEnv extends Env {
  SUPPORT: {
    getByName(name: string): { fetch(request: Request): Promise<Response> };
  };
}

/** One SQLite object owns all replay claims, including across Worker restarts. */
export class SupportPayments {
  private handle: (request: Request) => Promise<Response>;
  constructor(state: State, env: Env) {
    const sql = state.storage.sql;
    sql.exec(
      "CREATE TABLE IF NOT EXISTS replay (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER NOT NULL)",
    );
    const read = (key: string) => {
      const row =
        [...sql.exec("SELECT value FROM replay WHERE key = ?", key)][0];
      return row ? JSON.parse(String(row.value)) : null;
    };
    const put = (key: string, value: unknown) => {
      // Only charge replay markers are used; no credentials or wallet data.
      const expires = (value as { expires?: number })?.expires ??
        Date.now() + 600_000;
      sql.exec(
        "INSERT OR REPLACE INTO replay (key, value, expires) VALUES (?, ?, ?)",
        key,
        JSON.stringify(value),
        expires,
      );
    };
    const store: Store.AtomicStore = {
      get: (key) => Promise.resolve(read(key)),
      put: (key, value) => {
        put(key, value);
        return Promise.resolve();
      },
      delete: (key) => {
        sql.exec("DELETE FROM replay WHERE key = ?", key);
        return Promise.resolve();
      },
      update: (key, fn) =>
        Promise.resolve(state.storage.transactionSync(() => {
          sql.exec("DELETE FROM replay WHERE expires <= ?", Date.now());
          const change = fn(read(key));
          if (change.op === "set") put(key, change.value);
          if (change.op === "delete") {
            sql.exec("DELETE FROM replay WHERE key = ?", key);
          }
          return change.result;
        })),
    };
    this.handle = createHandler(env, store);
  }
  fetch(request: Request) {
    return this.handle(request);
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const invalid = routeError(request);
    if (invalid) return invalid;
    try {
      return await env.SUPPORT.getByName("feed-the-imps").fetch(request);
    } catch {
      return Response.json({
        error: "Testnet support unavailable; content remains free.",
      }, { status: 503 });
    }
  },
};
