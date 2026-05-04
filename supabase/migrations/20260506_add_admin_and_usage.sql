-- Add management columns to profiles table
alter table profiles 
add column if not exists is_admin boolean default false,
add column if not exists plan_status text default 'free', -- 'free' or 'pro'
add column if not exists proposal_count integer default 0,
add column if not exists asaas_customer_id text;

-- Policy to allow admins to view all profiles
-- Note: We check if the current user is an admin by querying their own row in profiles
create policy "Admins can view all profiles" 
on profiles for select 
using (
  (select is_admin from profiles where id = auth.uid()) = true
);

-- Policy to allow admins to update all profiles (for manual upgrades)
create policy "Admins can update all profiles" 
on profiles for update
using (
  (select is_admin from profiles where id = auth.uid()) = true
);
