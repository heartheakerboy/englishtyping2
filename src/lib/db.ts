import postgres from "postgres";

/**
 * Gets the database connection string from environment variables.
 */
function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

let _sql: ReturnType<typeof postgres> | undefined;

/**
 * Gets or initializes the postgres client.
 */
function getSqlClient() {
  if (!_sql) {
    const url = getDatabaseUrl();
    if (!url) {
      throw new Error(
        "Database connection error: DATABASE_URL is not set in environment variables."
      );
    }
    _sql = postgres(url, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return _sql;
}

/**
 * Database client Proxy to delay client creation until the first query is run,
 * preventing build-time errors when the database connection is not yet configured.
 */
export const sql = new Proxy(
  (() => {}) as any,
  {
    apply(_target, _thisArg, args) {
      const client = getSqlClient();
      return (client as any)(...args);
    },
    get(_target, prop) {
      const client = getSqlClient();
      return Reflect.get(client, prop);
    }
  }
) as unknown as ReturnType<typeof postgres>;

/**
 * Helper to run raw SQL queries with parameters.
 * Example:
 * const users = await query("SELECT * FROM profiles WHERE id = $1", [userId]);
 */
export async function query<T = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const client = getSqlClient();
    const result = await client.unsafe(text, params);
    return result as unknown as T[];
  } catch (error: any) {
    console.error("Database Query Error:", {
      text,
      params,
      error: error.message || error,
    });
    throw error;
  }
}
