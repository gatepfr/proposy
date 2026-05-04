# Gerador de Propostas Implementation Plan - Phase 1: Foundation & Branding

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup the Next.js project with Supabase and implement the user profile/branding management system.

**Architecture:** Next.js (App Router) for the UI, Supabase for Auth, DB (profiles table), and Storage (logos).

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`
- Create: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Create Next.js project structure**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm`
Expected: Project initialized in the current directory.

- [ ] **Step 2: Commit**
```bash
git add .
git commit -m "chore: initial next.js setup"
```

### Task 2: Supabase Integration

**Files:**
- Create: `lib/supabase.ts`
- Create: `.env.local`

- [ ] **Step 1: Install Supabase client**
Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Create Supabase client utility**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: Setup env file**
```text
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

- [ ] **Step 4: Commit**
```bash
git add lib/supabase.ts .env.local
git commit -m "feat: setup supabase client"
```

### Task 3: Branding Profile Schema

**Files:**
- Create: `supabase/migrations/20260504_create_profiles.sql`

- [ ] **Step 1: Define the SQL migration for profiles**
```sql
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

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260504_create_profiles.sql
git commit -m "feat: add profiles table schema"
```

### Task 4: Branding UI Component

**Files:**
- Create: `components/BrandingForm.tsx`
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Implement BrandingForm**
```tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BrandingForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert(formData)
    setLoading(false)
    if (error) alert(error.message)
    else alert('Branding saved!')
  }

  return (
    <div className="space-y-4 p-4 border rounded">
      <input 
        value={formData.company_name} 
        onChange={e => setFormData({...formData, company_name: e.target.value})}
        placeholder="Company Name"
        className="w-full p-2 border"
      />
      <input 
        type="color" 
        value={formData.primary_color} 
        onChange={e => setFormData({...formData, primary_color: e.target.value})}
        className="h-10 w-20"
      />
      <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-4 py-2">
        {loading ? 'Saving...' : 'Save Branding'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**
```bash
git add components/BrandingForm.tsx app/settings/page.tsx
git commit -m "feat: implement branding settings UI"
```
