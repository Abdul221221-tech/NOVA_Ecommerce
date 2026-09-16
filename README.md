# NOVA E-Commerce

> **A modern, full-stack multi-vendor marketplace built for speed, elegance, and scale.**

NOVA is a high-performance e-commerce marketplace platform. Built from the ground up to support multiple independent sellers, NOVA provides a seamless shopping experience for customers while offering powerful, dedicated management tools for sellers and platform administrators.

---

## 📖 Project Overview

Traditional e-commerce platforms often struggle to balance the needs of multiple vendors while maintaining a unified shopping experience. NOVA solves this by providing a unified storefront that elegantly aggregates products from independent sellers, securely managing authentication, cart state, order processing, and seller workflows under one roof.

### Target Users
- **Customers**: Can browse products, manage their wishlist and cart, securely checkout, and track their orders.
- **Sellers**: Independent vendors who manage their own stores, products, inventory, and order fulfillment.
- **Administrators**: Platform owners who oversee marketplace health, manage global categories/brands, approve sellers, and monitor platform-wide analytics.

### The Marketplace Workflow
1. **Sellers** register and list their products on the platform.
2. **Customers** discover products through search, categories, or brands, and place orders.
3. The platform securely processes the checkout.
4. **Sellers** receive order notifications and fulfill their respective items.
5. **Customers** track their order status and manage returns from their dashboard.

---

## ✨ Key Features

### Customer Features
- **Modern Storefront**: Highly interactive UI with smooth animations.
- **Personalized Dashboard**: Track orders, manage profile settings, and view return/exchange history.
- **Cart & Wishlist**: Persistent cart and wishlist functionality securely synced with user accounts.

### Seller Features
- **Dedicated Dashboard**: Independent portal (`/seller`) for managing store operations.
- **Product Management**: Full CRUD capabilities for products, including image uploads and stock management.
- **Order Fulfillment**: Track, process, and update the status for customer orders assigned to the seller.

### Admin Features
- **Platform Oversight**: Centralized dashboard (`/platform-admin`) for monitoring the entire marketplace.
- **Category & Brand Management**: Create and manage global categories and brands available to all sellers.
- **User Management**: View customer and seller data, and manage overall platform integrity.

### Core Capabilities
- **Authentication**: Secure role-based access control (Customer, Seller, Admin) powered by Supabase Auth.
- **Search & Filtering**: Dynamic product discovery by category, brand, and search terms.
- **Address & Checkout**: Streamlined checkout flow with support for saved shipping addresses and Stripe integration.
- **Notifications**: Dropdown notifications for order updates and platform alerts.
- **Responsive Design**: Flawless experience across all device sizes, down to 320px mobile screens.

---

## ❓ Q&A / How NOVA Works

**What is NOVA?**
NOVA is a multi-vendor e-commerce platform where independent sellers can list products for customers to discover and purchase in a unified storefront.

**Who can use NOVA?**
The platform supports three distinct roles: everyday shoppers (Customers), independent vendors (Sellers), and marketplace operators (Admins).

**How does customer shopping work?**
Customers browse the storefront, utilize category/brand filters, add items to their cart, and proceed through a secure checkout. 

**How does seller functionality work?**
Sellers log into a completely isolated dashboard where they can add products to the global catalog, monitor their own sales analytics, and update the shipping status of their orders.

**How are products managed?**
Sellers create and manage their own products (including variants, stock, and images). Admins oversee global categories and brands to ensure marketplace consistency.

**How does cart/wishlist work?**
State is managed efficiently across the application. Logged-in users have their cart and wishlist data securely synced to the database, ensuring persistence across devices.

**How does order management work?**
A single customer order might contain items from multiple sellers. NOVA intelligently splits order items so each seller only sees and fulfills the items belonging to their store.

**How does the responsive design work?**
The UI uses fluid Tailwind CSS grids and intelligent mobile-first components (like off-canvas menus and bottom navigation bars) to ensure full functionality on mobile devices without horizontal scrolling.

**What technologies are used?**
NOVA leverages the Next.js App Router, Supabase (PostgreSQL + Auth), Tailwind CSS, and Framer Motion.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, Server Components, Server Actions)
- **Library**: React
- **Language**: TypeScript
- **Database & Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Payments**: Stripe
- **Deployment**: Vercel

---

## 🏗️ Project Architecture

NOVA follows a modern, scalable architecture separating client-side interactivity from secure server-side logic:
- **Frontend**: Utilizes Next.js Server Components for SEO and fast initial loads, reserving Client Components strictly for interactive elements (like cart management and animations).
- **Backend**: Relies on Next.js Server Actions for secure database mutations, communicating directly with Supabase.
- **Database**: PostgreSQL hosted on Supabase, utilizing Row Level Security (RLS) to ensure data isolation.

### Folder Structure
```text
NOVA_Ecommerce/
├── app/
│   ├── (storefront)/       # Customer-facing website (Home, Shop, Cart, Checkout)
│   ├── account/            # Customer profile and order history
│   ├── seller/             # Isolated Seller Dashboard
│   ├── platform-admin/     # Isolated Admin Dashboard
│   ├── api/                # API routes and webhooks
│   └── actions/            # Secure Server Actions
├── components/
│   ├── storefront/         # UI components for the storefront
│   ├── seller/             # UI components for the seller dashboard
│   ├── admin/              # UI components for the admin dashboard
│   ├── auth/               # Authentication forms and wrappers
│   └── ui/                 # Reusable primitive UI components (shadcn/ui)
└── lib/
    ├── supabase/           # Supabase client configurations
    └── utils/              # Helper functions
```

---

## 📦 Main Project Modules

- **Home**: Landing page featuring hero carousels, featured categories, and new arrivals.
- **Shop & Categories**: Dynamic product grids with active filtering by brand and category.
- **Product Details**: Immersive product pages with image galleries, related products, and add-to-cart functionality.
- **Cart & Wishlist**: Dedicated slide-out and full-page modules for managing desired items.
- **Checkout**: Multi-step checkout and address selection mapped to a Stripe payment flow.
- **Profile & Orders**: Customer portal to track active orders, manage addresses, and request returns/exchanges.
- **Seller Dashboard**: Complete vendor CMS for analytics, product inventory, promotions, and order fulfillment.
- **Admin Dashboard**: Master control panel for global platform oversight, category/brand creation, and refunds.
- **Authentication**: Custom branded login and registration flows handling all three user roles.

---

## 🚀 Projects / Development Work

Major development milestones achieved in this project:
- **Customer Marketplace**: Engineered a fluid storefront with advanced routing and state management.
- **Seller System**: Built a secure, isolated vendor portal.
- **Admin Management**: Developed centralized management tools for maintaining catalog structure.
- **Responsive/Mobile Experience**: Overhauled navigation systems (including mobile bottom nav and dynamic off-canvas sidebars) to guarantee flawless screen support down to 320px width.
- **Product and Order Management**: Implemented complex relational data models to handle multi-vendor order splitting.
- **Authentication and Database Integration**: Synced complex platform state securely using Supabase Auth and database operations.

---

## 📱 Responsive Design

NOVA is meticulously crafted to provide a native-feeling experience across all devices:
- **Desktop & Laptop**: Expansive grids, hover-activated mega menus, and immersive imagery.
- **Tablet**: Adaptive layouts that gracefully scale down columns and touch targets.
- **Mobile**: Thumb-friendly bottom navigation replacing top-heavy headers.
- **Small Mobile (320px)**: Carefully calculated paddings and font scaling to prevent horizontal overflow on mini iPhones and older devices.

---

## ⚙️ Installation & Setup

To run NOVA locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nova-ecommerce.git
   cd nova-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy the example environment file and fill in your Supabase and Stripe credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to view the application.

5. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔐 Environment Variables

The project requires the following environment variables (defined in `.env.local`). **Never commit real secrets to version control.**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payment Integration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

---

## 🌍 Deployment

NOVA is optimized for deployment on **Vercel**:

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the required Environment Variables in the Vercel dashboard.
4. Deploy. Vercel will automatically detect the Next.js framework and configure the build settings.

---

## 🔮 Future Improvements

While NOVA is fully functional, realistic roadmap improvements include:
- **AI Semantic Search**: Enhancing the search bar to understand natural language queries.
- **Stripe Connect Integration**: Automating direct payout splits between the platform and individual sellers.
- **Google Maps Integration**: Implementing address auto-complete during checkout to reduce delivery errors.
- **Real-Time Support Chat**: Integrating real-time customer-to-seller messaging via Supabase Realtime.

---

## 📸 Screenshots / Demo

- **Live Demo**:
- **GitHub Repository**: [https://github.com/yourusername/nova-ecommerce](#)

*(Placeholder for Screenshots)*
- *Desktop Home Page*
- *Mobile Checkout Flow*
- *Seller Dashboard Analytics*

---

## 👨‍💻 Credits / Author

Designed and developed by **Abdul Waheed**.

If you have any questions or would like to collaborate, feel free to open an issue or reach out!
