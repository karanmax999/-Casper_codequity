# Universal Profile Page Design

**Date:** 2026-07-04  
**Status:** Draft  
**Author:** Claude Code (with user collaboration)  
**Project:** CodeQuity Launchpad (Casper Network)  
**Related:** Investor Onboarding Design (`2026-07-04-investor-onboarding-design.md`)

---

## 1. Problem Statement

Currently, the dashboard lacks a unified profile page for all authenticated users. When a non-investor user visits `/dashboard/profile` (or similar), they see a terse message "You do not have an active investor profile." We need to provide a polished, informative profile page that works for **every** logged-in user—admin, investor, or regular user—with appropriate content and calls-to-action for each role.

---

## 2. Current State

- No dedicated profile page exists in the dashboard. The only user-facing pages are dashboard, rounds, startups, etc.
- The system has three conceptual user types:
  - **Admin:** Identified by email check (`isAdmin()`), can create rounds, view admin panels
  - **Investor:** Has a record in `investors` table (linked by email currently, but should be linked by `user_id` to `auth.users`)
  - **User:** Authenticated but without investor record
- Investor records are currently linked only by email; there is no `user_id` foreign key to Supabase auth users. This makes reliable lookups difficult if emails change.
- The investor registration flow will soon add `approved` status and should link to auth user.

---

## 3. Goals & Requirements

### Functional Requirements
1. **Universal profile page** at `/dashboard/profile` accessible to any authenticated user.
2. **Role-based content:**
   - **Admin:** Read-only account info (email, role) + admin shortcut links (Review Investors, Create Rounds)
   - **Investor:** Full editable profile form including:
     - Personal info (name, email prefill, company)
     - Professional details (job title, website, LinkedIn)
     - Investment parameters (AUM, check size, focus, notes)
     - **Casper wallet public key** (required for round creation, with warning if missing)
   - **User (no investor record):** Clear value proposition and CTA to apply as an investor
3. **Save functionality** for investors using a Server Action that validates ownership.
4. **Success feedback** after profile save (toast or inline message).
5. **Navigation:** Add "Profile" link to dashboard layout (header or user menu).

### Non-Functional Requirements
- Match existing Web3 Premium aesthetic: dark theme, neon green accents, glassmorphism, Space Grotesk/Inter/Data Mono fonts.
- Responsive layout (mobile-friendly).
- Server-side authorization; no client-side database access.
- TypeScript type safety.
- Smooth UI with appropriate loading states.

---

## 4. Proposed Solution

### 4.1 Database Changes

We need to link `investors` to `auth.users` via `user_id` for reliable, email-independent lookup.

```sql
-- Migration: supabase/migrations/20260704_add_user_id_to_investors.sql

ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);

-- Backfill existing investor records by matching email
UPDATE investors
SET user_id = auth.users.id
FROM auth.users
WHERE investors.email = auth.users.email
  AND investors.user_id IS NULL;
```

**Note:** This assumes all existing investor records have emails that match `auth.users`. If any fail, manual review will be needed.

### 4.2 Server Actions (frontend/src/actions.ts)

Add the following actions:

#### `getMyInvestorRecord()`
```ts
export async function getMyInvestorRecord():
  Promise<ActionResult<Investor | null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { ok: true, data };
}
```

#### `updateInvestorProfile(data: Partial<Investor>)`
```ts
export async function updateInvestorProfile(
  data: Partial<Investor>
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  // Find investor record by user_id
  const { data: investor } = await supabase
    .from("investors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!investor) return { ok: false, error: "Investor record not found" };

  // Whitelist editable fields
  const allowed = [
    "job_title", "website", "linkedin", "aum", "check_size",
    "focus", "notes", "wallet_pubkey"
  ];
  const updates = Object.keys(data)
    .filter((k) => allowed.includes(k))
    .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {});

  const { error } = await supabase
    .from("investors")
    .update(updates)
    .eq("id", investor.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/profile");
  return { ok: true };
}
```

**Note:** `Investor` type should be imported from `@/types/launchpad` or defined locally if needed.

### 4.3 Page Architecture

**File:** `frontend/src/app/dashboard/profile/page.tsx` (Server Component)

```tsx
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch investor record by user_id
  const { data: investor } = user?.id ? (
    await supabase.from("investors").select("*").eq("user_id", user.id).maybeSingle()
  ) : { data: null };

  const role = user?.email && isAdmin(user.email)
    ? "admin"
    : investor
      ? "investor"
      : "user";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">My Profile</h1>
      <ProfileContent
        user={user}
        investor={investor}
        role={role}
      />
    </div>
  );
}
```

### 4.4 Client Component: `ProfileContent`

**File:** `frontend/src/components/profile/ProfileContent.tsx`

#### Props
```ts
{
  user: { id?: string; email?: string } | null;
  investor: Investor | null;
  role: "admin" | "investor" | "user";
}
```

#### Rendering Logic

**Left Column (Account Info + Role-specific Sidebar):**
- **Account Section** (always):
  - Email (readonly)
  - Role badge (colored: admin purple, investor green, user gray)
  - "Change Password" link (static for now)
- **Admin Tools** (if role === "admin"):
  - Links: "Review Investors" → `/dashboard/admin/investors`, "Create Round" → `/dashboard/admin/rounds/create`
- **Get Started** (if role === "user"):
  - Brief CTA about becoming an investor
  - "Apply Now" button → `/investor/register`

**Right Column (Main Content):**
- **Investor** (editable form): All fields from investor record, organized in grid (2 columns on desktop). Includes wallet_pubkey field with warning if empty.
- **User** (CTA card): "No Investor Profile Yet" with description and application button.
- **Admin** (read-only summary): Could show a brief note: "You are an administrator. Use the admin tools in the sidebar." But admin might also have an investor record? Unlikely but possible. We'll treat admin as read-only profile (no form) regardless of investor record. Admin investors would still see admin view; they can edit profile via investor view if needed, but design decision: admins are not expected to have investor profiles. Keep it simple: if role === admin, show admin sidebar and a message that profile is managed via auth provider.

#### Form State & Submission
- Use `useState` to manage formData (initialized from `investor` prop on mount).
- Save button triggers `updateInvestorProfile(formData)` Server Action with `useTransition`.
- Show inline success/error message.
- Show warning banner if `wallet_pubkey` is missing.

### 4.5 Navigation Integration

Add "Profile" link to the dashboard layout. Likely location: top header next to user avatar/name, or in a user dropdown menu. The exact placement should match existing design patterns in the app.

**File:** `frontend/src/app/dashboard/layout.tsx` (or a separate Nav component). Look for existing navigation items and add:

```tsx
<Link href="/dashboard/profile" className="...">
  Profile
</Link>
```

Styling: consistent with other nav links.

---

## 5. Security & Authorization

- All data fetching happens in Server Components or Server Actions, using server-side Supabase client with session cookies.
- `updateInvestorProfile` action:
  - Verifies user session
  - Ensures the investor record belongs to the current `user_id` (not by email)
  - Updates only whitelisted fields
  - Returns error if record not found
- No client-side direct DB access.
- Admin view does not expose any sensitive data beyond what's already visible to the user.

---

## 6. Implementation Steps

1. **Database:** Create migration `20260704_add_user_id_to_investors.sql` and apply to Supabase.
2. **Backfill:** Run the UPDATE statement to populate `user_id` for existing investors.
3. **Types:** Ensure `Investor` type includes all necessary fields (including `wallet_pubkey`, `user_id` may be optional).
4. **Server Actions:** Add `getMyInvestorRecord` and `updateInvestorProfile` to `frontend/src/actions.ts`.
5. **Page:** Create `app/dashboard/profile/page.tsx` (Server Component).
6. **Component:** Build `components/profile/ProfileContent.tsx` with conditional rendering.
7. **Form:** Implement investor edit form with all fields, using existing UI patterns (glass-card, input styles).
8. **Styling:** Apply consistent spacing, typography, and colors. Add Framer Motion entrance if desired (optional).
9. **Navigation:** Add "Profile" link to dashboard layout.
10. **Testing:**
    - Log in as admin → visit profile → see admin tools, no form
    - Log in as investor → see editable form, can save changes, wallet warning if missing
    - Log in as user without investor → see CTA card
    - Verify revalidation after save shows updated data
11. **Polish:** Add toast notifications (if using Sonner), error handling, mobile responsiveness.

---

## 7. Success Criteria

- [ ] `/dashboard/profile` loads for any authenticated user without errors.
- [ ] Admin sees role badge, email, and admin shortcut links.
- [ ] Investor sees fully editable form with all fields; can save changes; sees success message.
- [ ] User without investor record sees clear CTA to apply.
- [ ] Wallet missing warning displays for investors without `wallet_pubkey`.
- [ ] No data leakage: user can only update their own investor record.
- [ ] UI matches the Web3 Premium aesthetic and is responsive.
- [ ] "Profile" link appears in dashboard navigation and routes correctly.

---

## 8. Out of Scope

- Email change functionality (handled by Supabase auth)
- Password change UI (out of scope for this feature; can link to Supabase reset)
- Two-factor authentication settings
- Profile picture/avatar upload
- Investor approval workflow (separate spec)
- Notifications preferences
- Advanced security settings

---

## 9. Open Questions

None at this time. The design is ready for implementation.
