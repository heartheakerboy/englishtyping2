-- Add welcome_email_sent to public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;

-- Mark all existing profiles as sent, so existing users don't get welcome emails
UPDATE public.profiles SET welcome_email_sent = true;
