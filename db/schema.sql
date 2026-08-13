-- Chic Fragrance Platform — future Postgres / Supabase schema
-- Local runtime currently uses data/platform/db.json with the same model.
-- Apply this when migrating to Supabase; enable RLS on all tenant tables.

create extension if not exists "pgcrypto";

create type platform_role as enum (
  'PLATFORM_ADMIN',
  'OWNER',
  'MANAGER',
  'EMPLOYEE',
  'VIEWER'
);

create type org_status as enum ('active', 'suspended', 'trial');
create type user_status as enum ('active', 'invited', 'suspended');
create type subscription_status as enum ('inactive', 'active', 'past_due', 'cancelled');
create type landing_page_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');

create table organizations (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  status org_status not null default 'trial',
  plan text not null default 'FREE',
  currency text not null default 'DZD',
  country text not null default 'Algeria',
  timezone text not null default 'Africa/Algiers',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create table profiles (
  id text primary key,
  email text not null unique,
  name text not null,
  phone text,
  avatar_url text,
  organization_id text references organizations(id) on delete set null,
  role platform_role not null,
  status user_status not null default 'active',
  permissions jsonb not null default '[]'::jsonb,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table invitations (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  role platform_role not null,
  permissions jsonb not null default '[]'::jsonb,
  token text not null unique,
  status text not null default 'pending',
  invited_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table subscriptions (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  plan_id text not null,
  status subscription_status not null default 'inactive',
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table integrations (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  provider text not null,
  type text not null,
  configuration jsonb not null default '{}'::jsonb,
  status text not null default 'disconnected',
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table landing_pages (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  created_by text not null,
  name text not null,
  slug text not null,
  status landing_page_status not null default 'DRAFT',
  product_id text,
  content jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (organization_id, slug)
);

create table audit_logs (
  id text primary key,
  actor_user_id text,
  organization_id text,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS sketch (enable when using Supabase Auth + JWT claims in app_metadata)
-- alter table organizations enable row level security;
-- create policy org_member_select on organizations
--   for select using (
--     id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
--     or (auth.jwt() -> 'app_metadata' ->> 'role') = 'PLATFORM_ADMIN'
--   );
