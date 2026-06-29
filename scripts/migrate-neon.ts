import * as fs from "fs";
import * as path from "path";
import { Client } from "@neondatabase/serverless";

// 1. Simple dotenv parser to load .env file variables
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envText = fs.readFileSync(envPath, "utf-8");
    for (const line of envText.split(/\r?\n/)) {
      const part = line.trim();
      if (part && !part.startsWith("#")) {
        const index = part.indexOf("=");
        if (index > 0) {
          const key = part.substring(0, index).trim();
          let val = part.substring(index + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!dbUrl) {
  console.error("\x1b[31m%s\x1b[0m", "Error: DATABASE_URL or NEON_DATABASE_URL environment variable is missing.");
  console.error("Please add DATABASE_URL=\"your_neon_connection_string\" to your .env file.");
  process.exit(1);
}

const client = new Client(dbUrl);
const sql = (text: string, params?: any[]) => client.query(text, params);

async function runMigration() {
  console.log("\x1b[36m%s\x1b[0m", "Starting Neon Database Setup & Migrations...");

  try {
    await client.connect();
    // 2. Setup standard schemas, roles, and functions needed by Supabase schemas
    console.log("Preparing database environment (schemas, roles, functions)...");
    
    // Create roles if they don't exist
    await sql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
          CREATE ROLE service_role;
        END IF;
      END
      $$;
    `);

    // Create extensions
    await sql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await sql(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Create publication if it doesn't exist
    await sql(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_publication WHERE pubname = 'supabase_realtime') THEN
          CREATE PUBLICATION supabase_realtime;
        END IF;
      END
      $$;
    `);

    // Create auth schema and dummy auth.users table + auth.uid() function
    await sql(`CREATE SCHEMA IF NOT EXISTS auth;`);
    await sql(`
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE,
        raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    await sql(`
      CREATE OR REPLACE FUNCTION auth.uid()
      RETURNS UUID
      LANGUAGE sql STABLE
      AS $$
        SELECT id FROM auth.users LIMIT 1;
      $$;
    `);

    // Create storage schema and dummy storage tables
    await sql(`CREATE SCHEMA IF NOT EXISTS storage;`);
    await sql(`
      CREATE TABLE IF NOT EXISTS storage.buckets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner UUID,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        public BOOLEAN DEFAULT false
      );
    `);
    await sql(`
      CREATE TABLE IF NOT EXISTS storage.objects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id TEXT REFERENCES storage.buckets(id),
        name TEXT,
        owner UUID,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        last_accessed_at TIMESTAMPTZ DEFAULT now(),
        metadata JSONB DEFAULT '{}'::jsonb,
        path_tokens TEXT[]
      );
    `);

    // Create migrations metadata tracking table
    await sql(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    console.log("\x1b[32m%s\x1b[0m", "Database environment prepared successfully.");

    // 3. Load migration files
    const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.warn("\x1b[33m%s\x1b[0m", "Warning: supabase/migrations directory not found. No SQL migrations to run.");
      process.exit(0);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort(); // Sorts files chronologically by timestamp prefix

    if (files.length === 0) {
      console.log("No migration SQL files found in supabase/migrations.");
      process.exit(0);
    }

    // Get already applied migrations
    const appliedResult = await sql(`SELECT name FROM public._migrations;`);
    const appliedRows = appliedResult.rows || [];
    const appliedSet = new Set(appliedRows.map((r: any) => r.name));

    console.log(`Found ${files.length} total migration files. Checking for new migrations...`);

    let appliedCount = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");

      if (sqlContent.trim()) {
        try {
          await sql(sqlContent);
          await sql(`INSERT INTO public._migrations (name) VALUES ($1);`, [file]);
          console.log(`\x1b[32m✔ Applied ${file}\x1b[0m`);
          appliedCount++;
        } catch (err: any) {
          console.error(`\x1b[31m✖ Error applying migration ${file}:\x1b[0m`);
          throw err;
        }
      }
    }

    if (appliedCount === 0) {
      console.log("\x1b[32m%s\x1b[0m", "Database is up to date. No new migrations applied.");
    } else {
      console.log("\x1b[32m%s\x1b[0m", `Success! Applied ${appliedCount} migration(s) to Neon database.`);
    }

  } catch (error: any) {
    console.error("\x1b[31m%s\x1b[0m", "Migration failed:");
    console.error(error.message || error);
    await client.end().catch(() => {});
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runMigration();
