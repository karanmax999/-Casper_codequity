# Investor Onboarding & Approval Feature Design

**Date:** 2026-07-04  
**Status:** Draft  
**Author:** Claude Code (with user collaboration)  
**Project:** CodeQuity Launchpad (Casper Network)

---

## 1. Problem Statement

The current investor registration is a single, dense form without an approval workflow. Only administrators can create funding rounds, but we need to enable **approved investors** to create their own rounds using their Casper wallet. The goal is to create a professional, multi-step registration experience and an admin approval interface that integrates smoothly with the existing platform.

---

## 2. Current State

- **Investor Registration:** Single-page form at `/investor/register` with 10 fields, submitted to `/api/investor/register` (Next.js API route). Success message is generic.
- **Database:** `investors` table includes fields for investor data but lacks `approved` flag and link to auth user.
- **Dashboard:** Only admins can create rounds; regular users see generic stats. No distinction between pending and approved investors.
- **Authentication:** Separate `/sign-up` creates Supabase auth user; no automatic linking between auth account and investor record.
- **Round Creation:** Uses Next.js Server Actions that require admin API key; only visible to admins.

---

## 3. Goals & Requirements

### Functional Requirements
1. **Multi-step registration wizard** (3-4 steps) with smooth animations and progress indicator.
2. **Success screen** with message: "We'll review your application within 24 hours. In the meantime, you can browse startups on the platform."
3. **Admin approval page** listing pending investors with Approve/Reject actions.
4. **Investor approval status**: `approved` flag on investors table.
5. **Approved investors can create rounds** (only for themselves, using their own Casper wallet).
6. **Dashboard differentiation**:
   - Admin: existing command center
   - Approved investor: their own rounds list + create round button
   - Pending investor: banner showing pending status
7. **Wallet collection** via profile edit page; required before round creation.
8. **Security**: Investors can only create rounds where they are the investor; can only edit their own profile.

### Non-Functional Requirements
- Maintain existing Web3 Premium aesthetic (dark theme, neon green accents, glassmorphism, Space Grotesk/Inter).
- Use Framer Motion for smooth transitions.
- Type safety with TypeScript.
- Server-side authorization in Server Actions.
- No exposure of admin API key to client.

---

## 4. Proposed Solution

### 4.1 Database Schema Changes

```sql
-- Migration: supabase/migrations/20260704_add_investor_approval.sql

-- Add approval and auth linking columns
ALTER TABLE investors
  ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_investors_approved ON investors(approved);
```

**Rationale:**
- `approved` tracks application status.
- `user_id` reliably links the investor record to the Supabase auth user, avoiding email-matching issues.
- `approved_at` and `reviewed_by` provide audit trail.
- Indexes ensure fast lookups by user_id and approval status.

### 4.2 Backend Changes (Minimal)

No changes to FastAPI endpoints are required. All new logic will be handled in Next.js Server Actions, which continue to call the existing backend with the admin API key.

**New / Modified Server Actions (`frontend/src/actions.ts`):**

1. **`createFundingRound` (modified)**
   ```ts
   export async function createFundingRound(input: CreateLaunchpadRoundInput):
    Promise<ActionResult<{ id: string }>> {
     // 1. Get current user's session and investor record
     // 2. If user is admin (isAdmin): allow any investor_id, require admin key
     // 3. If user is not admin:
     //    - Ensure investor record exists and approved === true
     //    - Ensure wallet_pubkey exists
     //    - Override input.investor_id with current investor's ID
     //    - Proceed with backend call using admin key from env
     // 4. Return appropriate errors if checks fail
   }
   ```

2. **`evaluateRound` (modified)**
   ```ts
   export async function evaluateRound(roundId: string):
    Promise<ActionResult<{ released: boolean; message?: string }>> {
     // Get current user and investor record
     // If admin: allow any round
     // If investor: ensure round.investor_id === current investor ID
     // Then call backend evaluate endpoint
   }
   ```

3. **`approveInvestor` (new)**
   ```ts
   export async function approveInvestor(investorId: string):
   Promise<ActionResult<void>> {
     // Check current user is admin
     // Update investor: set approved = true, approved_at = now(), reviewed_by = current user ID
   }
   ```

4. **`rejectInvestor` (new)**
   ```ts
   export async function rejectInvestor(investorId: string):
   Promise<ActionResult<void>> {
     // Check admin
     // Option 1: set approved = false (already false) and maybe add rejected_at
     // Or delete the investor record? Keep for audit? We'll keep and mark.
   }
   ```

5. **`getMyInvestorRecord` (new)**
   ```ts
   export async function getMyInvestorRecord():
   Promise<ActionResult<Investor | null>> {
     // Get current user ID from session
     // Query investors table where user_id = current user ID
   }
   ```

6. **`updateInvestorProfile` (new)**
   ```ts
   export async function updateInvestorProfile(data: Partial<Investor>):
   Promise<ActionResult<void>> {
     // Get current user's investor record
     // Update allowed fields: job_title, website, linkedin, aum, check_size, focus, notes, wallet_pubkey
   }
   ```

**Security Note:** All Server Actions run on the server. They fetch the user's session using the Supabase server client (from `@/lib/supabase/server`). Authorization checks happen inside each action before database writes.

### 4.3 Frontend Changes

#### 4.3.1 Multi-step Registration Wizard

**Route:** `/investor/register` (replaces existing form)

**Component Structure:**
```tsx
// components/investor/RegistrationWizard.tsx
"use client";
export function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Investor>>({});
  // ...
}
```

**Steps:**

- **Step 1: Identity**
  - Full Name (required)
  - Work Email (prefilled if logged in, required)
  - Company / Firm (required)
  - [Next]

- **Step 2: Professional Details**
  - Job Title (optional)
  - Firm Website (optional)
  - LinkedIn Profile (optional)
  - [Back] [Next]

- **Step 3: Investment Parameters**
  - Assets Under Management (AUM) - select dropdown
  - Typical Check Size - select dropdown
  - Investment Focus - text input
  - [Back] [Next]

- **Step 4: Additional Notes & Review**
  - Additional Notes (textarea, optional)
  - Review section: summary of all entered data (read-only)
  - [Back] [Submit]

**UI/UX Details:**
- Progress indicator: "Step X of 4" with dots or progress bar at top.
- Framer Motion: `AnimatePresence` with `mode="wait"` and `initial={false}` to slide/fade between steps.
- Validation: required fields on each step; show inline errors.
- On submit: call existing `/api/investor/register` (or new Server Action that also sets `user_id` and `approved = false`). After success, show success screen and revalidate/redirect.

**Success Screen:**
```tsx
// components/investor/RegistrationSuccess.tsx
<GlassCard>
  <CheckCircle2 className="h-16 w-16 text-primary-container" />
  <h2>Application Received</h2>
  <p>
    We'll review your application within 24 hours. In the meantime, you can
    browse startups on the platform.
  </p>
  <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
</GlassCard>
```

**Design Tokens:** Use existing `primary-container` color (`#45f798`), glass-card styling, Space Grotesk for headlines, Inter/Data Mono for body.

#### 4.3.2 Admin Approval Interface

**Route:** `/dashboard/admin/investors` (new page under admin section)

**Layout:**
- Page header with title "Investor Applications"
- Tabs: Pending (default) | Approved | All
- Responsive table inside a glass-card

**Table Columns:**
| Name | Email | Firm | AUM | Check Size | Focus | Registered | Actions |
|------|-------|------|-----|------------|-------|------------|---------|

**Row Actions:**
- Approve button (green) → calls `approveInvestor` → toast success → refresh
- Reject button (red) → confirmation dialog → calls `rejectInvestor` → toast → refresh

**Implementation:**
```tsx
// app/dashboard/admin/investors/page.tsx
export default async function AdminInvestorsPage() {
  // Check admin
  // Fetch investors with filters based on tab
  // Render table
}
```

**Server Action for fetch:** Could reuse direct Supabase query in Server Component (since it's server-side) or create a Server Action for client-side filtering if we make it interactive. Simpler: Server Component with static tabs (each tab a separate Server Component call).

#### 4.3.3 Dashboard Updates

**File:** `frontend/src/app/dashboard/page.tsx`

**Logic Changes:**
```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const email = user?.email;

// Get investor record for current user (via user_id if available, fallback to email)
const { data: myInvestor } = await supabase
  .from("investors")
  .select("*")
  .eq("user_id", user?.id) // new column
  .maybeSingle();

if (isAdmin(email)) {
  // existing admin view
} else if (myInvestor) {
  if (myInvestor.approved) {
    // Investor Dashboard
  } else {
    // Pending approval view
  }
} else {
  // No investor record: show generic CTA to register
}
```

**Investor Dashboard Section:**
- Header: "My Funding Rounds"
- Fetch rounds where `investor_id = myInvestor.id` (need new Server Action `listMyRounds` or reuse `listLaunchpadRounds` and filter client-side; better to filter server-side)
- Display rounds using `RoundCard` component (existing)
- "Create New Round" button (links to `/dashboard/admin/rounds/create` but we'll adapt that page to handle investors)
- Wallet status: if `!myInvestor.wallet_pubkey`, show warning banner: "⚠️ You must add your Casper wallet public key before creating a round." with link to profile page.

**Pending Approval View:**
- Glass-card with message: "Your investor account is under review. We'll notify you once approved. In the meantime, explore startups below."
- Maybe show a list of startups (optional)

**CTA for Non-Investors:**
- "Apply to become an investor" button linking to `/investor/register`.

#### 4.3.4 Create Round Page Adaptation

**Route:** `/dashboard/admin/rounds/create` (extend to serve both admins and approved investors)

**Changes:**
- Get current user and investor record
- If not admin and not (approved investor): redirect to dashboard
- If approved investor:
  - Hide investor dropdown field
  - Investor ID automatically set to `myInvestor.id` (hidden input or just not pass it; Server Action will override)
- Show startup dropdown as before
- Add validation: if investor's `wallet_pubkey` missing, show error message before form renders or disable submit with a clear message: "Please add your wallet in your profile first."
- On submit, call `createFundingRound` with or without `investor_id` depending on role.

**Server Action `createFundingRound`** will:
- If caller is admin: require `X-Admin-Key` header env var passed (already present) and use `input.investor_id` as provided.
- If caller is investor (approved): ignore `input.investor_id`, use their own ID. Also re-check wallet_pubkey presence at submission time.
- Return error if user not authorized.

#### 4.3.5 Profile Edit Page

**Route:** `/dashboard/profile` (new)

**Purpose:** Allow investors to edit their profile and add their Casper wallet public key.

**Access:** Only logged-in users with an investor record.

**Fields:**
- Name (readonly, from investor record)
- Email (readonly)
- Company (readonly or editable? Could allow edit if needed, but for simplicity keep readonly except for new fields)
- Job Title (editable)
- Firm Website (editable)
- LinkedIn (editable)
- AUM (editable)
- Check Size (editable)
- Investment Focus (editable)
- Notes (editable)
- **Casper Wallet Public Key** (editable, required before round creation)
- Save button

**Implementation:**
- Server Component to fetch initial data
- "Use client" form with `useState` for fields
- On submit, call `updateInvestorProfile` Server Action
- Success toast and revalidation

**Navigation:** Add link in user menu or sidebar.

---

## 5. Security & Authorization

| Action | Who Can Perform | Check Location |
|--------|----------------|----------------|
| View admin approval page | Admins only | Page-level `isAdmin()` |
| Approve/Reject investor | Admins only | `approveInvestor` / `rejectInvestor` Server Action checks `isAdmin()` |
| Create funding round | Admins or approved investors with wallet | `createFundingRound` Server Action validates: admin OR (investor exists + approved + wallet_pubkey) |
| Evaluate round | Admins or owner investor | `evaluateRound` Server Action validates: admin OR (investor + round belongs to them) |
| Update own profile | Any logged-in investor | `updateInvestorProfile` ensures record belongs to user |
| View investor-specific rounds | Admin or that investor | Dashboard rendering depends on role; rounds filtered by investor ID |

**Data Isolation:**
- Investor queries always filter by `investor_id = current investor ID` (or by user_id).
- No client can query other investors' data directly.

**Admin Key Protection:** The admin API key remains server-side only (in Server Actions and backend). Never exposed to browser.

---

## 6. Implementation Phases (Suggested Order)

1. **Database migration:** Add `approved`, `user_id`, indexes.
2. **Server Actions:** Implement new and modified actions; add authorization logic.
3. **Investor registration wizard:** Build multi-step component and success screen.
4. **Admin approval page:** Table with approve/reject actions.
5. **Dashboard updates:** Add conditional rendering for investor view.
6. **Create round page:** Adapt to support investors.
7. **Profile edit page:** Allow wallet and info updates.
8. **Navigation & polish:** Add links, toast notifications, error handling.
9. **Testing:** End-to-end flows for each user role.

---

## 7. Success Criteria

- [ ] Investor can sign up, complete wizard, and see success message.
- [ ] Admin sees pending investors list and can approve/reject.
- [ ] Approved investor's dashboard shows "Create Round" button and their own rounds.
- [ ] Create round works for investors only with wallet_pubkey set.
- [ ] Unauthorized access attempts (e.g., non-approved investor) are blocked with clear messages.
- [ ] All UI matches the existing Web3 Premium aesthetic with smooth transitions.
- [ ] All server-side operations enforce proper authorization.

---

## 8. Out of Scope (Future Phases)

- Email notifications upon approval/rejection
- Investor invitation flow (magic link)
- Investor-specific analytics or portfolio tracking beyond their rounds
- Bulk approval actions
- Advanced filtering and search in admin investor list
- Internationalization

---

## 9. Open Questions

None at this time. The design is ready for implementation planning.
