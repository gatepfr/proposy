-- Create an RPC function to atomically increment the proposal count
create or replace function public.increment_proposal_count(user_id uuid)
returns void as $$
begin
  update profiles 
  set proposal_count = proposal_count + 1 
  where id = user_id;
end;
$$ language plpgsql security definer;
