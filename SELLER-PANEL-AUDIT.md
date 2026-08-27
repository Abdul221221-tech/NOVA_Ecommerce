# Seller Panel Audit

## Overview
This report details the current state of the NOVA Seller Panel (`app/seller/*`), including functional status, data integrity, UI/UX structure, and recommended improvements. The primary focus is identifying discrepancies (hardcoded data, misrouted logic) and suggesting a prioritized roadmap for bringing the panel to production readiness.

---

## 1. Existing Seller Sections & Current Status

| Section | Route | Data Status | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `/seller` | 🟡 Mixed | Real aggregate metrics (Total/Pending Orders, Returns, Cancellations) via `DashboardOverviewClient`. However, the **Sales Trend chart is a hardcoded SVG placeholder**. |
| **All Products** | `/seller/products` | 🟢 Real | Fully functional. Fetches products specific to the seller's `store_id`. |
| **Add Product** | `/seller/products/new` | 🟢 Real | Functional creation form for products and variants. |
| **Orders** | `/seller/orders` | 🟢 Real | Lists seller-specific orders with correct RLS isolation. |
| **OMS (Cancellations/Returns/Exchanges/Refunds)** | `/seller/cancellations` etc. | 🟢 Real | Separate pages for Order Management System requests. Fetches real inner-joined data based on `store_id`. |
| **Sales Overview** | `/seller/sales` | 🔴 **Fake Data** | Uses completely hardcoded placeholder values (e.g., "$18,450 Net Sales"). Has a placeholder div instead of a data table. |
| **Analytics** | `/seller/analytics` | 🟢 Real | Excellent real-time charts using Recharts for 30-day revenue trends and category performance. |
| **Promotions** | `/seller/promotions` | 🟢 Real | Coupon/Discount management. |
| **Notifications** | `/seller/notifications` | 🔴 **Bugged Logic** | Currently calls `fetchNotifications()` (which fetches Customer-side notifications) instead of the provided `fetchSellerNotifications()` which dynamically generates notifications from store orders. |
| **Settings** | `/seller/settings` | 🟢 Real | Stripe Connect payout onboarding and status. |

---

## 2. Missing Features & UI/UX Improvements Needed

### UI/UX Sidebar Consolidation
The current sidebar has 13 direct links. It is slightly overwhelming. The OMS (Order Management) links clutter the primary navigation.
**Recommended Structure:**
- Overview (Dashboard)
- Products (All Products, Add Product)
- Orders & Fulfillment (Orders, Cancellations)
- Returns & Refunds (Returns, Exchanges, Refunds)
- Finance & Reports (Analytics, Sales/Payouts)
- Store Management (Store Profile, Promotions, Settings)

### Empty States & Loading Skeletons
Most tables (Orders, Returns, Sales) lack polished empty states with Call-To-Action (CTA) buttons (e.g., "Add your first product", "Share your store link"). 

### Sales Ledger
Because `/seller/sales` currently holds fake data, the application is missing a proper "Payout / Ledger" view showing sellers exactly what funds are cleared, pending, and transferred to their Stripe accounts.

---

## 3. Dynamic Seller Dashboard Requirements

The dashboard **must strictly** adhere to Row Level Security (RLS) isolation. Based on the audit, the backend RLS and queries are correctly isolating data via `store_id`. Seller A cannot see Seller B's data.

The Dashboard *should* show:
*   **KPIs:** Total Orders, Revenue, Pending Orders.
*   **Visual Chart:** A real-time 30-day revenue chart (currently fake SVG).
*   **Actionable Items:** Low stock alerts, unread OMS requests.
*   **Recent Activity:** The last 5 orders placed.

---

## 4. Implementation Roadmap (Prioritized)

### 🔴 Critical (Do This First)
1.  **Fix Notifications Bug:** Update `app/seller/(dashboard)/notifications/page.tsx` to call `fetchSellerNotifications()` instead of `fetchNotifications()`. This will immediately populate the panel with real seller alerts (New orders, return requests).
2.  **Remove or Fix `/seller/sales`:** Either delete this page (since `/seller/analytics` already handles revenue reporting) OR rewrite it to show an actual ledger of `orders` and `refunds` using real Supabase data.
3.  **Fix Dashboard Chart:** In `DashboardOverviewClient.tsx`, replace the hardcoded `<svg>` path with a small Recharts component or pass down the 30-day calculated data from the Server Component.

### 🟡 Important
1.  **Sidebar Restructuring:** Update `SidebarClient.tsx` to group the heavy OMS links (Returns, Exchanges, Cancellations, Refunds) into a cleaner nested menu or a single "Resolutions" page to declutter the UI.
2.  **AOV Calculation Fix:** In `analytics/page.tsx`, ensure the AOV (Average Order Value) handles zero-division cleanly and only calculates based on successfully fulfilled/paid orders.

### 🟢 Optional (Polish)
1.  **Implement EmptyState Components:** Use the existing `EmptyState.tsx` component inside Orders, Refunds, and Returns to give sellers better onboarding feedback when they first register.
2.  **Low Stock Warnings:** Add a widget on the main Dashboard to flag products where `product_variants.stock_quantity < 5`.
