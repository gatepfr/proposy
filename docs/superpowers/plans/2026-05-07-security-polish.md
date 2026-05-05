# Gerador de Propostas Implementation Plan - Phase 5: Production Security & Final Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the database, enforce server-side usage limits, and connect the payment UI.

**Architecture:** Implement strict RLS policies, update Next.js API routes to perform server-side checks, and link the frontend to the Asaas checkout endpoint.

**Tech Stack:** Next.js, Supabase RLS, Asaas API.

---

### Task 1: Database Hardening (RLS)

**Files:**
- Create: `supabase/migrations/20260507_secure_profile_fields.sql`

- [ ] **Step 1: Prevent self-promotion**
Update policies so users can only update safe fields (`full_name`, `company_name`, `logo_url`, `primary_color`, `secondary_color`, `font_family`, `bio`).
Only the service role (backend) or admins should be able to change `plan_status`, `is_admin`, and `proposal_count`.

```sql
-- Revoke update permission on sensitive columns for normal users
-- In Supabase, we achieve this by splitting the update policy or using a trigger
create or replace function check_update_allowed_fields()
returns trigger as $$
begin
  if (old.plan_status <> new.plan_status or old.is_admin <> new.is_admin or old.proposal_count <> new.proposal_count) then
    if (current_setting('role') <> 'service_role' and (select is_admin from profiles where id = auth.uid()) = false) then
      raise exception 'Você não tem permissão para alterar campos de sistema.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_check_update_fields
before update on profiles
for each row
execute procedure check_update_allowed_fields();
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260507_secure_profile_fields.sql
git commit -m "security: lock down sensitive profile fields in database"
```

### Task 2: Server-Side Usage Enforcement

**Files:**
- Modify: `app/api/generate/route.ts`

- [ ] **Step 1: Add limit check in the API**
Before calling OpenAI, fetch the user profile and check:
`if (profile.plan_status === 'free' && profile.proposal_count >= 1) throw Error`

- [ ] **Step 2: Increment usage in the API**
Perform the `proposal_count` increment on the server after successful generation to ensure accuracy and security.

- [ ] **Step 3: Commit**
```bash
git add app/api/generate/route.ts
git commit -m "security: enforce server-side usage limits and tracking"
```

### Task 3: Payment UI Connection

**Files:**
- Modify: `components/ProposalGenerator.tsx`

- [ ] **Step 1: Connect "Assinar Pro" button to Asaas API**
Implement the call to `fetch('/api/payments/checkout')` and redirect the user to the `invoiceUrl`.

- [ ] **Step 2: Add "Admin" link in the header**
Add a discrete "Admin" button/link that only shows for `is_admin === true`.

- [ ] **Step 3: Commit**
```bash
git add components/ProposalGenerator.tsx
git commit -m "feat: connect payment UI and add admin access link"
```
