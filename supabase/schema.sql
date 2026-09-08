-- MMP Tree Service — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run

create table if not exists blog_categories (
  name text primary key
);

create table if not exists blog_posts (
  slug text primary key,
  title text not null default '',
  date text not null default '',
  excerpt text not null default '',
  cover_image text not null default '',
  cover_image_alt text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  seo_title text not null default '',
  seo_description text not null default '',
  body_markdown text not null default '',
  focus_keyword text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  alt text not null default '',
  tags text[] not null default '{}',
  uploaded_at timestamptz not null default now()
);

create table if not exists hero_assignments (
  slug text primary key,
  media_id uuid not null references media(id) on delete cascade
);

-- Enable RLS with no policies: only the app's server-side secret key
-- (which always bypasses RLS) reads/writes these tables. This blocks the
-- publishable key from accessing them over Supabase's public REST API.
alter table blog_categories enable row level security;
alter table blog_posts enable row level security;
alter table media enable row level security;
alter table hero_assignments enable row level security;
