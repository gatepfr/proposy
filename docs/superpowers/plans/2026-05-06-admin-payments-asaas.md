# Gerador de Propostas Implementation Plan - Phase 4: Admin & Payments (Asaas)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the admin management dashboard and Asaas payment integration.

**Architecture:** Extend the `profiles` table to include `is_admin`, `plan_status`, and `usage_count`. Create a secure admin route and an Asaas checkout/webhook flow.

**Tech Stack:** Asaas API, Supabase, Next.js.

---

### Task 1: Database Expansion & Usage Tracking

**Files:**
- Create: `supabase/migrations/20260506_add_admin_and_usage.sql`

- [ ] **Step 1: Add management columns to profiles**
```sql
alter table profiles 
add column is_admin boolean default false,
add column plan_status text default 'free', -- 'free' or 'pro'
add column proposal_count integer default 0,
add column asaas_customer_id text;

-- Policy for admin access
create policy "Admins can view all profiles" 
on profiles for select 
using ( (select is_admin from profiles where id = auth.uid()) = true );
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260506_add_admin_and_usage.sql
git commit -m "feat: add admin and plan status columns to profiles"
```

### Task 2: Admin Dashboard UI

**Files:**
- Create: `app/admin/page.tsx`
- Create: `components/AdminUserList.tsx`

- [ ] **Step 1: Implement Admin Page**
Create a table showing Name, Email (if available), Plan, Usage, and a button to manually toggle 'Pro'.

- [ ] **Step 2: Add Security Check**
Ensure only `is_admin = true` can render the content.

- [ ] **Step 3: Commit**
```bash
git add app/admin/page.tsx components/AdminUserList.tsx
git commit -m "feat: implement initial admin dashboard"
```

### Task 3: Asaas Payment Integration (Checkout)

**Files:**
- Create: `app/api/payments/checkout/route.ts`
- Create: `app/api/payments/webhook/route.ts`
- Modify: `.env.local` (add ASAAS_API_KEY)

- [ ] **Step 1: Implement Checkout Route**
Create an endpoint that generates a link/Pix for the 'Pro' plan in Asaas.

- [ ] **Step 2: Implement Webhook Route**
Handle `PAYMENT_RECEIVED` from Asaas to update the user's `plan_status` to 'pro' in Supabase.

- [ ] **Step 3: Commit**
```bash
git add app/api/payments/
git commit -m "feat: integrate asaas checkout and webhook"
```

### Task 4: Usage Limits & UI Feedback

**Files:**
- Modify: `components/ProposalGenerator.tsx`

- [ ] **Step 1: Add limit check**
Block generation if `plan_status === 'free'` and `proposal_count >= 1`.

- [ ] **Step 2: Add "Upgrade" CTA**
Show a professional modal or banner asking the user to subscribe if they hit the limit.

- [ ] **Step 3: Commit**
```bash
git add components/ProposalGenerator.tsx
git commit -m "feat: implement plan limits and upgrade prompts"
```
