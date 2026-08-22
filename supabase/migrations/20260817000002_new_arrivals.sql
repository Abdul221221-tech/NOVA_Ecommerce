-- Add is_new_arrival and is_coming_soon flags to products table
alter table public.products
  add column if not exists is_new_arrival boolean not null default false,
  add column if not exists is_coming_soon boolean not null default false;

-- Index for fast querying new arrivals
create index if not exists products_is_new_arrival_idx on public.products (is_new_arrival, created_at desc);
