create table if not exists public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Allow anon to insert
create policy "Allow public inserts" on public.contact_messages
  for insert with check (true);

-- Allow platform admin to view
create policy "Allow admin select" on public.contact_messages
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'platform_admin'
    )
  );
