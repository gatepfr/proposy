-- Trigger function to prevent users from changing sensitive fields
create or replace function public.check_update_allowed_fields()
returns trigger as $$
begin
  -- Use IS DISTINCT FROM to handle NULLs correctly
  if (old.plan_status is distinct from new.plan_status or 
      old.is_admin is distinct from new.is_admin or 
      old.proposal_count is distinct from new.proposal_count) then
    
    -- Allow change ONLY IF:
    -- 1. It is the service_role (backend)
    -- 2. OR the user is an admin (using the existing helper function)
    if (current_setting('role') <> 'service_role' and public.check_is_admin() = false) then
      raise exception 'Você não tem permissão para alterar campos de sistema (plano, admin ou contagem).';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Apply trigger to profiles table
drop trigger if exists trigger_check_update_fields on profiles;
create trigger trigger_check_update_fields
before update on profiles
for each row
execute procedure check_update_allowed_fields();

-- Add NOT NULL constraints for hardening
alter table profiles alter column is_admin set not null;
alter table profiles alter column plan_status set not null;
alter table profiles alter column proposal_count set not null;
