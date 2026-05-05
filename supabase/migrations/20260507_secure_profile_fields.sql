-- Trigger function to prevent users from changing sensitive fields
create or replace function public.check_update_allowed_fields()
returns trigger as $$
begin
  -- If sensitive fields are being changed
  if (old.plan_status <> new.plan_status or old.is_admin <> new.is_admin or old.proposal_count <> new.proposal_count) then
    -- Allow change ONLY IF:
    -- 1. It is the service_role (backend)
    -- 2. OR the user is an admin
    if (current_setting('role') <> 'service_role' and (select is_admin from profiles where id = auth.uid()) = false) then
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
