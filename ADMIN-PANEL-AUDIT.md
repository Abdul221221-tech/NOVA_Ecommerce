# NOVA Admin Panel Security & Architecture Audit

## 1. What Currently Exists
The NOVA platform currently has two parallel administrative structures:
1. `app/admin/(dashboard)/*` - A modernized, dark-themed admin panel with a comprehensive folder structure (`dashboard`, `sellers`, `products`, `orders`, `refunds`, etc.).
2. `app/platform-admin/*` - An older legacy admin panel structure.

**Working Functionality:**
- **Route Protection**: The `proxy.ts` middleware correctly intercepts unauthenticated users and restricts access to `/admin/*` and `/platform-admin/*` based on the database role.
- **Admin Server Actions**: Functions in `app/actions/admin.ts` (like `approveStore`, `rejectStore`) correctly perform a strict `platform_admin` check before executing database updates.
- **Dashboard Layout**: The `layout.tsx` component in `app/admin` forces an authenticated DB check, creating a strong barrier.

---

## 2. What is Missing & Incomplete
- **Pagination**: None of the admin pages (Products, Orders, Sellers, Dashboard metrics) utilize server-side pagination. Queries like `supabase.from('orders').select('*')` pull the *entire* database into memory.
- **Activity Logs UI**: The `admin.ts` actions log audit entries into `admin_activity_log`, but the `app/admin/(dashboard)/activity-logs/page.tsx` file does not exist; admins cannot read the audit trail from the UI.
- **Consolidated Refunds/Returns Workflow**: The `Orders` page has a "Refunds" tab, but there is also a dedicated `Refunds` page for `return_requests` and `exchange_requests`. The workflow is highly fragmented.
- **True Financial Workflows**: Approving a refund simply changes the string `status` in the database. There is no actual Stripe or payment gateway integration hooking into these server actions to physically move the money.
- **Role Management**: There is no UI to promote staff to `platform_admin`.

---

## 3. What is Broken / Insecure (Severity Classification)

### 🔴 CRITICAL
**1. Seller Privilege Escalation / Financial Manipulation in Refunds**
- **Location**: `app/actions/oms.ts` -> `updateRefundStatus`
- **Issue**: The logic checks if a user is either an Admin OR the Seller. However, it does not restrict the *target status*. A rogue Seller can directly call this action and mark a refund as `completed` (faking a refund state) bypassing the Platform Admin entirely. Sellers should only be able to approve the *return*, while the *refund execution* must strictly belong to the Platform Admin.

### 🟠 HIGH
**2. Broken Role Authorization Logic**
- **Location**: `app/actions/oms.ts`
- **Issue**: The OMS actions check for admins using `profile?.role === 'admin'`. However, the entire platform actually relies on the role `'platform_admin'`. This means actual Platform Admins evaluate to `false` and are systematically blocked from processing returns or refunds unless they own the store.

**3. Application Crash on Admin Products Page**
- **Location**: `app/admin/(dashboard)/products/page.tsx`
- **Issue**: The page queries `select('id, name, price...')` from the `products` table. The `products` schema uses the column `title`, not `name`. Visiting `/admin/products` currently results in a PostgREST error, completely breaking the page.

**4. Memory Exhaustion / Unscalable Metric Queries**
- **Location**: `app/admin/(dashboard)/dashboard/page.tsx`
- **Issue**: The dashboard calculates total platform revenue by downloading the `platform_fee` of *every single order in the database* to the Node edge server and running a Javascript `.reduce()`. This will cause Serverless Function timeouts and crash the server once the platform scales past a few thousand orders.

### 🟡 MEDIUM
**5. Redirect Loops & Duplicated Admin Logic**
- **Location**: `app/admin/(dashboard)/orders/page.tsx`
- **Issue**: The modernized `/admin/orders` page was copy-pasted from `/platform-admin`. Inside `app/admin/orders`, unauthenticated users or those failing role checks are explicitly redirected to `/platform-admin/login` and `/` rather than `/admin/login`, creating a confusing UX loop.

### 🔵 LOW
**6. Inconsistent Data Models**
- **Location**: Multiple pages (e.g. `sellers/page.tsx`)
- **Issue**: Code relies on `(data as any)` instead of strict TypeScript typing based on the Supabase schema, making future refactoring dangerous.

---

## 4. Implementation Roadmap (What to Fix First)

**Phase 1: Security & Crash Fixes (Immediate)**
1. Fix the `'admin'` vs `'platform_admin'` string mismatch in `app/actions/oms.ts`.
2. Restrict Sellers from marking refunds as `completed` in `updateRefundStatus`.
3. Fix the `products/page.tsx` query changing `name` to `title` so the page actually loads.

**Phase 2: Scalability & Consolidation**
4. Delete the legacy `app/platform-admin` directory entirely to prevent split-brain logic and redirect loops. Update all `redirect('/platform-admin/...')` calls to `/admin/...`.
5. Rewrite `AdminDashboardPage` metrics to use Supabase RPCs (stored procedures) to calculate SUMs natively in Postgres instead of downloading all rows to the Next.js server.
6. Add `limit()` and `range()` pagination to Orders, Products, and Sellers pages.

**Phase 3: Real Workflows**
7. Build out the `activity-logs` UI.
8. Integrate actual Payment Gateway API calls into the Refund approval server action.
