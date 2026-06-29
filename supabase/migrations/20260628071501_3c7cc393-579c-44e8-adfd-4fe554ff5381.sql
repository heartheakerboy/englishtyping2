
do $$ begin
  create type public.app_role as enum ('admin','editor','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public settings readable" on public.site_settings for select to anon, authenticated using (is_public = true);
create policy "admin manage settings" on public.site_settings for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into public.site_settings(key, value, is_public) values
  ('analytics', '{"ga_id":"","clarity_id":"","plausible_domain":""}'::jsonb, true),
  ('seo_defaults', '{"title":"English Typing Test","description":"Practice typing in 11 languages with realtime stats."}'::jsonb, true),
  ('features', '{"premium_enabled":false,"newsletter_enabled":true}'::jsonb, true)
on conflict (key) do nothing;

create table if not exists public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select on public.blog_authors to anon, authenticated;
grant all on public.blog_authors to service_role;
alter table public.blog_authors enable row level security;
create policy "authors public read" on public.blog_authors for select to anon, authenticated using (true);
create policy "admin manage authors" on public.blog_authors for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
grant select on public.blog_categories to anon, authenticated;
grant all on public.blog_categories to service_role;
alter table public.blog_categories enable row level security;
create policy "cats public read" on public.blog_categories for select to anon, authenticated using (true);
create policy "admin manage cats" on public.blog_categories for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_markdown text not null default '',
  cover_image text,
  author_id uuid references public.blog_authors(id) on delete set null,
  category_id uuid references public.blog_categories(id) on delete set null,
  status text not null default 'draft',
  seo_title text, seo_description text, og_image text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_status_pub_idx on public.blog_posts(status, published_at desc);
grant select on public.blog_posts to anon, authenticated;
grant all on public.blog_posts to service_role;
alter table public.blog_posts enable row level security;
create policy "posts public read published" on public.blog_posts for select to anon, authenticated using (status = 'published');
create policy "admin manage posts" on public.blog_posts for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger blog_posts_updated before update on public.blog_posts for each row execute function public.set_updated_at();

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmed boolean not null default true,
  source text,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, update, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "anyone can subscribe" on public.newsletter_subscribers for insert to anon, authenticated with check (true);
create policy "admin read subscribers" on public.newsletter_subscribers for select to authenticated using (public.is_admin(auth.uid()));
create policy "admin delete subscribers" on public.newsletter_subscribers for delete to authenticated using (public.is_admin(auth.uid()));

create table if not exists public.typing_texts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  language text not null default 'english',
  category text not null default 'articles',
  difficulty text not null default 'medium',
  content text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.typing_texts to anon, authenticated;
grant all on public.typing_texts to service_role;
alter table public.typing_texts enable row level security;
create policy "texts public read active" on public.typing_texts for select to anon, authenticated using (is_active = true);
create policy "admin manage texts" on public.typing_texts for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger typing_texts_updated before update on public.typing_texts for each row execute function public.set_updated_at();

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  percent_off integer check (percent_off between 1 and 100),
  amount_off_cents integer,
  currency text default 'USD',
  max_redemptions integer,
  redeemed_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "admin manage coupons" on public.coupons for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "users read active coupon" on public.coupons for select to authenticated using (is_active = true);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  provider text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "user reads own sub" on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy "admin manage subs" on public.subscriptions for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger subs_updated before update on public.subscriptions for each row execute function public.set_updated_at();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'succeeded',
  provider text,
  provider_payment_id text,
  invoice_url text,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments(user_id, created_at desc);
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "user reads own payments" on public.payments for select to authenticated using (user_id = auth.uid());
create policy "admin reads all payments" on public.payments for select to authenticated using (public.is_admin(auth.uid()));
create policy "admin manage payments" on public.payments for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
grant insert on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "users file reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "admin manage reports" on public.reports for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
