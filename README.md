# NOVA Ecommerce

A modern, full-stack multi-vendor marketplace built with Next.js 15, Supabase, and TypeScript.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

---

## 🏗️ Project Architecture

The project follows a modern Next.js App Router architecture.

A typical structure may look like:

```text
NOVA_Ecommerce/
│
├── app/
│   ├── admin/
│   ├── seller/
│   ├── shop/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── profile/
│   └── ...
│
├── components/
│   ├── admin/
│   ├── seller/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── ...
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   └── ...
│
├── public/
│   ├── images/
│   └── ...
│
├── types/
│   └── ...
│
├── styles/
│   └── ...
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

> The actual directory structure should be treated as the source of truth. The above structure describes the architectural organization rather than requiring folders that do not already exist.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Payments | Stripe |
| Deployment | Vercel |
| Package Manager | npm |

---

## 🎨 Design System

NOVA uses a cohesive design system built on:

* **Tailwind CSS** — Utility-first styling
* **Framer Motion** — Smooth animations and transitions
* **Custom Components** — Reusable UI primitives
* **Design Tokens** — Consistent colors, spacing, typography

### Visual Identity

The goal is to make the interface feel:

> **Premium + Modern + Fast + Interactive**

rather than looking like a generic marketplace template.

---

## 🎬 Animations

Framer Motion is used for interactive motion and micro-interactions.

Examples include:

* Hover animations
* Product card interactions
* Button feedback
* Page transitions
* Loading animations
* Staggered content
* Modal transitions

Animations should enhance usability rather than become a distraction.

---

## 📱 Responsive Design

NOVA is designed for multiple screen sizes.

The UI adapts to:

```text
Desktop
Laptop
Tablet
Mobile
```

Components such as:

* Navigation
* Filters
* Product grids
* Checkout
* Cards
* Forms
* Dashboards

are designed to adapt to smaller screens.

---

## ⚡ Performance

Performance is a major consideration in NOVA.

The application uses modern Next.js concepts such as:

* App Router
* Server Components
* Server-side rendering where appropriate
* Client Components only where needed
* Optimized data fetching
* Caching/revalidation where appropriate
* Optimized assets

The objective is to avoid shipping unnecessary JavaScript to the browser.

---

## 🧩 Server Components vs Client Components

NOVA uses Next.js's server/client architecture.

### Server Components

Used where interactive browser state is not required.

Examples:

* Product data rendering
* Server-side data fetching
* Static content
* Layout structures

### Client Components

Used where browser interaction is required.

Examples:

* Interactive buttons
* Wishlist actions
* Cart interactions
* Forms
* Animations
* Client-side state

The project attempts to keep the client boundary as small as practical.

---

## ⚡ Server Actions

Server Actions can be used for server-side mutations such as:

* Updating profile information
* Newsletter subscription
* Password changes
* Database mutations
* Other authenticated operations

This reduces unnecessary client-side API boilerplate while keeping sensitive operations on the server.

---

## 🧯 Error Handling

A production-style application must assume that things will fail.

NOVA accounts for cases such as:

* Network failure
* Invalid input
* Missing database records
* Unauthorized requests
* Expired sessions
* Empty search results
* Empty cart
* Out-of-stock products
* Failed mutations
* Payment problems

The objective is to provide users with understandable feedback rather than exposing raw errors.

---

## 🔍 Empty States

Empty states are important for a good user experience.

Examples:

```text
No products found
No wishlist items
No cart items
No orders yet
No notifications
No seller products
No analytics data
```

Instead of leaving the page blank, NOVA can provide useful guidance and actions.

---

## 🔄 Loading States

Loading states are used where data may take time to appear.

Examples include:

* Product loading
* Search loading
* Order loading
* Dashboard loading
* Form submission
* Authentication checks

Skeleton loaders can be used where appropriate to reduce layout shifts.

---

## 🔐 Security Considerations

Security is one of the most important parts of a multi-vendor marketplace.

Important considerations include:

* Secure authentication
* Authorization
* RLS policies
* Server-side validation
* Input validation
* Protected routes
* Secure environment variables
* No exposure of private API keys
* Seller data isolation
* Admin access restrictions
* Payment security

Frontend restrictions alone are not sufficient.

---

## 🛡️ Admin Dashboard

The admin dashboard provides platform-wide oversight.

### Core Sections

* **Overview** — Key metrics, recent activity, platform health
* **Products** — Product management, approvals, inventory
* **Categories** — Category hierarchy, subcategories
* **Brands** — Brand management
* **Customers** — Customer management, order history
* **Orders** — Order management, fulfillment
* **Returns/Exchanges** — Return and exchange requests
* **Payments** — Transaction monitoring
* **Payouts** — Platform-level financial overview
* **Support** — Customer support tickets
* **Marketing** — Coupons, banners, promotions
* **Settings** — Platform configuration

### Product Management

Admin can manage all products across the marketplace.

Product management includes:

* Product approval/rejection
* Product editing
* Product deletion
* Status management (active/inactive/draft)
* Featured product selection
* Bulk actions

### Image Management

Product images are handled with care:

```text
Image 1
Primary Cover

Image 2
Gallery Image

Image 3
Gallery Image
```

Uploaded images should provide:

* Upload progress/loading state
* Immediate preview
* Successful upload confirmation
* Error handling
* Retry functionality
* Persistent image URL
* Correct association with the product

---

## 📊 Inventory Management

Inventory can be managed inside the Products section.

Inventory includes:

* Available stock
* Low stock
* Out of stock
* Stock adjustments
* Product variants
* Stock history

Stock should be connected to actual product data rather than static frontend values.

---

## 🗂️ Categories

Admin can manage website-wide categories.

Category management includes:

* Main categories
* Subcategories
* Product count
* Status
* Created date
* Add
* Edit
* Delete
* Activate/deactivate

Categories should be reflected consistently throughout the marketplace.

---

## 🏷️ Brands

Brand management includes:

* Brand name
* Logo
* Description
* Product count
* Status
* Created date
* Add
* Edit
* Delete
* Activate/deactivate
* View products

---

## 👥 Customer Management

Admin can view necessary customer information:

* Name
* Email
* Phone
* Address
* Total orders
* Purchase history
* Account status
* Joined date
* Last order

Customer details may include:

* Saved delivery addresses
* Order history
* Returns
* Refunds

### Password Privacy

Customer passwords must **never** be visible to administrators.

---

## 💳 Payments

The Payments section provides platform-level transaction information.

Metrics include:

* Total transactions
* Successful payments
* Failed payments
* Pending payments
* Refunded payments
* Total transaction value

Payment records include:

* Transaction ID
* Order ID
* Customer
* Amount
* Payment method
* Payment status
* Date
* Refund status

---

## 💰 Payouts & Financial Privacy

Seller financial information is intentionally protected.

Admin must not receive unnecessary seller-specific financial data such as:

* Seller earnings
* Seller revenue
* Seller profit
* Seller commission
* Seller wallet balance
* Seller payout amount
* Seller financial ranking

Instead, platform-level financial information can include:

* Gross Sales
* Discounts
* Shipping Revenue
* Tax Collected
* Refunds
* Cancelled Orders
* Payment Fees
* Platform Earnings
* Net Estimated Earnings

---

## 🎫 Support System

The support system can manage customer tickets.

Ticket information includes:

* Open tickets
* Pending tickets
* Resolved tickets
* Priority
* Customer
* Order ID
* Issue
* Messages
* Attachments
* Status
* Created date
* Resolved date

Admin/support actions:

* Reply
* Assign
* Close
* Reopen

---

## 📣 Marketing

Marketing functionality includes:

* Coupons
* Discount codes
* Flash sales
* Offers
* Homepage banners
* Promotional banners
* Featured products

---

## 🔎 Smarter Search

Future search improvements may include:

* Typo tolerance
* Semantic search
* Synonyms
* Personalized results
* Better ranking
* AI-assisted search

---

## 💬 Real-Time Support

A future support system could provide:

* Customer support chat
* Seller communication
* Admin support
* Real-time messages
* Notifications

Supabase Realtime can potentially be used for real-time communication.

---

## 📍 Google Maps Integration

The checkout experience may eventually include Google Maps functionality for:

* Address autocomplete
* Location selection
* Reverse geocoding
* More accurate delivery addresses

---

## 🔔 Notification System

A complete notification system can notify users about:

### Customers

* Order received
* Order confirmed
* Order shipped
* Order delivered
* Cancellation
* Refund
* Exchange
* Promotions

### Sellers

* New order received
* Product stock alerts
* Order cancellation
* Refund request
* Exchange request

### Admins

* New seller registration
* Platform events
* Seller issues
* Marketplace activity

---

## 🗄️ Database & Architecture

NOVA uses:

```text
Next.js
   ↓
Application Logic
   ↓
Supabase
   ↓
PostgreSQL
```

The application should use the existing database schema whenever possible.

If an appropriate table already exists, it should be extended rather than creating a duplicate competing table.

---

## 🔄 Return / Exchange Data Model

Return/exchange records require information such as:

```text
request_id
order_id
order_item_id
customer_id
product_id
seller_id
request_type
reason
description
evidence
status
requested_variant
refund_amount
refund_method
requested_at
approved_at
pickup_date
received_at
completed_at
rejected_at
rejection_reason
admin_notes
```

The exact implementation should follow the project's existing database naming conventions.

---

## 💵 Financial Privacy

Seller-specific financial information should never be unnecessarily exposed to administrators.

Financial analytics remain platform-level where required.

---

## 🔑 Environment Variables

Sensitive configuration must be stored in environment variables.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

```text
GitHub
   ↓
Vercel
   ↓
Build
   ↓
Environment Variables
   ↓
Production Deployment
```

### Security

Before deployment, make sure:

* Environment variables are configured
* Database URLs are correct
* Authentication URLs are updated
* Payment configuration is correct
* Production database policies are enabled
* No secrets are committed
* Production build succeeds

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the maintainers.