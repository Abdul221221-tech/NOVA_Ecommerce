-- Create a global search queries tracking table
-- This records how many times each search term has been used across all users
create table if not exists public.search_queries (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  count integer not null default 1,
  last_searched_at timestamptz not null default now(),
  constraint search_queries_term_unique unique (term)
);

-- Allow upserts from anon users (so every visitor's search is tracked)
alter table public.search_queries enable row level security;

create policy "Anyone can read search_queries"
  on public.search_queries for select
  using (true);

create policy "Anyone can insert search_queries"
  on public.search_queries for insert
  with check (true);

create policy "Anyone can update search_queries"
  on public.search_queries for update
  using (true);

-- Index for fast sorting by popularity
create index if not exists search_queries_count_idx on public.search_queries (count desc);
