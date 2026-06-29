import { neon } from "@neondatabase/serverless";

/**
 * Gets the Neon database connection string from environment variables.
 */
function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
}

/**
 * Neon stateless client (HTTP-based, perfect for serverless functions/server functions).
 * This uses a Proxy to delay client creation until the first query is run,
 * preventing build-time errors when the database connection is not yet configured.
 */
export const sql = new Proxy(
  (() => {}) as any,
  {
    apply(_target, _thisArg, args) {
      const url = getDatabaseUrl();
      if (!url) {
        throw new Error(
          "Database connection error: DATABASE_URL or NEON_DATABASE_URL is not set in environment variables."
        );
      }
      const client = neon(url);
      return (client as any)(...args);
    },
    get(_target, prop) {
      const url = getDatabaseUrl();
      if (!url) {
        throw new Error(
          "Database connection error: DATABASE_URL or NEON_DATABASE_URL is not set in environment variables."
        );
      }
      const client = neon(url);
      return Reflect.get(client, prop);
    }
  }
) as unknown as ReturnType<typeof neon>;

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
    const result = await (sql as any).query(text, params);
    return result as unknown as T[];
  } catch (error: any) {
    console.error("Neon DB Query Error:", {
      text,
      params,
      error: error.message || error,
    });
    throw error;
  }
}
