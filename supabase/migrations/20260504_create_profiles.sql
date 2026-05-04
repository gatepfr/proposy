create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  company_name text,
  logo_url text,
  primary_color text default '#2563eb',
  secondary_color text default '#64748b',
  font_family text default 'Inter',
  bio text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
