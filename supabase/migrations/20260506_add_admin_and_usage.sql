-- Add management columns to profiles table
alter table profiles 
add column if not exists is_admin boolean default false,
add column if not exists plan_status text default 'free',
add column if not exists proposal_count integer default 0,
add column if not exists asaas_customer_id text;

-- Add constraints for data integrity
alter table profiles 
add constraint profiles_plan_status_check check (plan_status in ('free', 'pro')),
add constraint profiles_proposal_count_check check (proposal_count >= 0);

-- Use a SECURITY DEFINER function to avoid RLS recursion
create or replace function public.check_is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- Policies for admin access using the helper function
create policy "Admins can view all profiles" 
on profiles for select 
using (public.check_is_admin());

create policy "Admins can update all profiles" 
on profiles for update
using (public.check_is_admin());
