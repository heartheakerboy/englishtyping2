import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ResultInput = z.object({
  mode: z.enum(["time", "words", "quote", "paragraph", "code", "custom", "ai"]),
  mode_value: z.number().int().nonnegative(),
  wpm: z.number().nonnegative(),
  raw_wpm: z.number().nonnegative(),
  accuracy: z.number().min(0).max(100),
  cpm: z.number().nonnegative(),
  consistency: z.number().min(0).max(100).nullable(),
  chars_correct: z.number().int().nonnegative(),
  chars_incorrect: z.number().int().nonnegative(),
  chars_extra: z.number().int().nonnegative(),
  chars_missed: z.number().int().nonnegative(),
  duration_seconds: z.number().positive(),
  language: z.string().default("english"),
});

export const saveResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResultInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("typing_results")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listMyResults = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("typing_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data;
  });
