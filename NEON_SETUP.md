# Neon Database Setup & Integration Guide

This project is now prepared to connect and migrate to a **Neon serverless PostgreSQL database**. 

To handle the transition smoothly, we've added a **Neon serverless client** and a **migration runner** that enables you to deploy your existing database migrations directly to Neon.

---

## 🚀 Getting Started

### 1. Set Up Your Neon Database
1. Go to [Neon.tech](https://neon.tech) and create a project.
2. Retrieve your connection string from the Neon dashboard (under the **Connection Details** section). It will look like this:
   `postgresql://alex:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 2. Configure Environment Variables
Open your `.env` file in the root of the project and add your Neon connection string:

```env
DATABASE_URL="postgresql://alex:password@ep-cool-snowflake-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## 📂 Database Migrations

Your project contains migrations defined in `supabase/migrations/*.sql`. Since raw PostgreSQL databases do not natively include Supabase-specific entities (like the `auth` schema, roles like `authenticated`, or storage tables), running these migrations directly would normally fail.

To solve this, we created a custom migration runner in [migrate-neon.ts](file:///f:/latest/scripts/migrate-neon.ts) that:
1. Pre-creates the `auth` and `storage` schemas.
2. Creates the default Supabase roles (`authenticated`, `anon`, `service_role`).
3. Mocks the `auth.users` table and `auth.uid()` function.
4. Executes your SQL migrations chronologically.
5. Tracks executed migrations in a `public._migrations` table to prevent re-running.

### Run Migrations to Neon:
Run the following command in your terminal:

```bash
npm run db:migrate
```
*(Or, if you use Bun)*:
```bash
bun run scripts/migrate-neon.ts
```

---

## 💻 Querying the Neon Database in Server Functions

We created a Neon database client at [db.ts](file:///f:/latest/src/lib/db.ts) that provides a stateless HTTP client (`sql`) and a helper function (`query`) optimized for serverless executions (like TanStack Start server functions).

### Example: Migrating from Supabase Client to Neon Client

#### Before (Supabase JS Client):
```typescript
import { createClient } from "@supabase/supabase-js";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const { data: rooms, error } = await sb
  .from("rooms")
  .select("id, name, status")
  .eq("visibility", "public")
  .order("created_at", { ascending: false });
```

#### After (Neon SQL Client):
```typescript
import { query } from "@/lib/db";

// Query public rooms directly using raw SQL
const rooms = await query(
  `SELECT id, name, status 
   FROM rooms 
   WHERE visibility = $1 
   ORDER BY created_at DESC`,
  ['public']
);
```

### Parameterized Queries (Safe against SQL Injection)
Always use `$1, $2, $3...` placeholders to pass variables into queries:

```typescript
import { query } from "@/lib/db";

// Fetch single room by its code
const rooms = await query("SELECT * FROM rooms WHERE code = $1 LIMIT 1", [code]);
const room = rooms[0] || null;
```

### Insert and Update Queries
```typescript
import { query } from "@/lib/db";

// Insert a new record
await query(
  `INSERT INTO room_members (room_id, user_id, display_name) 
   VALUES ($1, $2, $3)`,
  [roomId, userId, displayName]
);

// Update progress
await query(
  `UPDATE room_members 
   SET progress = $1, wpm = $2 
   WHERE room_id = $3 AND user_id = $4`,
  [progress, wpm, roomId, userId]
);
```
