import { Metadata } from 'next'
import Link from 'next/link'
import { 
  FileText, Store, Shield, CreditCard, UserCheck, 
  ShoppingBag, Package, RefreshCcw, Copyright, 
  AlertOctagon, MessageSquare, Settings, Scale, 
  AlertTriangle, RefreshCw, Power, Mail, CheckCircle2 
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms & Conditions | NOVA',
  description: 'Read the Terms & Conditions governing your use of the NOVA Marketplace platform.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 max-w-4xl py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Terms & Conditions</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-wider">Last Updated: 19 August 2026</p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to NOVA Marketplace. These Terms & Conditions govern your access to and use of the NOVA website, marketplace, and related services as a customer or independent seller.
        </p>
        <p className="text-sm mt-4 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 inline-block px-6 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
          By creating an account, accessing NOVA, purchasing products, or selling products through the platform, you acknowledge that you have read, understood, and agree to these Terms.
        </p>
      </div>
      
      <div className="space-y-12">
        {/* Quick Overview */}
        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 md:p-10 text-white shadow-lg border border-indigo-400 dark:border-indigo-500/30">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-white/90" />
            <h2 className="text-3xl font-bold">Quick Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
              <h3 className="font-bold flex items-center gap-2 mb-2"><Store className="w-5 h-5 text-indigo-200" /> Multi-Vendor</h3>
              <p className="text-sm text-white/80">NOVA connects independent sellers with customers.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
              <h3 className="font-bold flex items-center gap-2 mb-2"><Shield className="w-5 h-5 text-indigo-200" /> Secure Accounts</h3>
              <p className="text-sm text-white/80">You are responsible for keeping your account credentials secure.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
              <h3 className="font-bold flex items-center gap-2 mb-2"><CreditCard className="w-5 h-5 text-indigo-200" /> Secure Payments</h3>
              <p className="text-sm text-white/80">Payments are processed through trusted payment providers.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20">
              <h3 className="font-bold flex items-center gap-2 mb-2"><UserCheck className="w-5 h-5 text-indigo-200" /> Seller Duty</h3>
              <p className="text-sm text-white/80">Sellers are responsible for their products, listings, fulfillment, and return policies.</p>
            </div>
          </div>
        </section>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. The NOVA Marketplace */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. The NOVA Marketplace</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">NOVA operates as a multi-vendor marketplace platform allowing independent sellers to list products directly to customers. NOVA does not manufacture, own, store, or independently inspect products unless explicitly stated.</p>
            <p className="text-sm text-muted-foreground mb-3">NOVA does not independently guarantee the:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-4">
              <li>Quality or safety of a product</li>
              <li>Accuracy of seller descriptions</li>
              <li>Legality or availability of a product</li>
              <li>Suitability for a particular purpose</li>
            </ul>
            <p className="text-sm font-medium text-slate-900 dark:text-white p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              Product-related questions, disputes, warranties, or issues should generally be addressed with the respective seller.
            </p>
          </section>

          {/* 2. User Accounts */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. User Accounts</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">When creating an account, you agree to provide accurate info, protect your password, and not share your credentials. You are responsible for activities performed through your account.</p>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Account Suspension</h3>
            <p className="text-sm text-muted-foreground">NOVA may suspend, restrict, or terminate an account if we reasonably believe it:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Violates these Terms or policies</li>
              <li>Is involved in fraudulent or illegal activity</li>
              <li>Creates a security or safety risk</li>
              <li>Abuses other users or marketplace services</li>
            </ul>
          </section>
        </div>

        {/* 3. Seller Responsibilities */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Seller Responsibilities</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Product Listings</h3>
              <p className="text-sm text-muted-foreground mb-4">Sellers must ensure their listings are accurate, complete, up to date, not misleading, and consistent with laws. Descriptions, images, pricing, and availability must accurately represent the product.</p>
              
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-red-500">Prohibited Products</h3>
              <p className="text-sm text-muted-foreground mb-2">Sellers may not list products that are:</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1 mb-4">
                <li>Illegal, fraudulent, or counterfeit</li>
                <li>Hazardous where prohibited</li>
                <li>Stolen or restricted by law</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Order Fulfillment & Returns</h3>
              <p className="text-sm text-muted-foreground mb-4">Sellers are responsible for preparing orders, packaging, shipping within stated periods, providing tracking, and handling eligible returns according to their policies.</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
                NOVA may remove listings or restrict seller accounts when prohibited activity is identified. Sellers are responsible for handling their own returns, refunds, and exchanges.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 4 & 5. Payments & Fees */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10 lg:col-span-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-accent-primary" /> 4. Payments & 5. Fees</h3>
            <p className="text-sm text-muted-foreground mb-4"><strong>Seller Payouts:</strong> Processed through Stripe Connect. Sellers must comply with Stripe's terms for verification and compliance.</p>
            <p className="text-sm text-muted-foreground"><strong>Platform Fees:</strong> NOVA retains a platform fee from successful transactions, communicated during registration. Fees may be updated according to agreements.</p>
          </div>
          
          {/* 6 & 7. Purchasing & Prices */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10 lg:col-span-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-accent-primary" /> 6. Purchasing & 7. Prices</h3>
            <p className="text-sm text-muted-foreground mb-4">Transactions are between you and the seller. Review product details, seller info, and policies before ordering.</p>
            <p className="text-sm text-muted-foreground">Prices are generally in INR (Indian Rupees). Prices may change before placing an order. Additional shipping charges or taxes may apply at checkout.</p>
          </div>
        </div>

        {/* 8, 9, 10, 11 Section */}
        <section className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-8 md:p-10 border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500" /> 8. Payments</h3>
              <p className="text-sm text-muted-foreground mb-6">Payments are processed through secure third-party providers (Stripe). NOVA does not store raw credit card information. Transactions may be declined or require verification.</p>
              
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Package className="w-5 h-5 text-blue-500" /> 9. Orders & Availability</h3>
              <p className="text-sm text-muted-foreground">Placing an order doesn't guarantee availability until processed. Orders may be cancelled due to unavailability, pricing errors, fraud, or fulfillment issues. Eligible cancelled orders will be refunded.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Package className="w-5 h-5 text-purple-500" /> 10. Shipping & Delivery</h3>
              <p className="text-sm text-muted-foreground mb-6">Handled by sellers and carriers. Estimates are not guaranteed dates. Multi-seller orders arrive separately. NOVA is not responsible for external delays (weather, customs, carrier issues).</p>
              
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-amber-500" /> 11. Returns & Refunds</h3>
              <p className="text-sm text-muted-foreground">Eligibility depends on the seller's policy. Customers must follow instructions provided. Damaged or incorrect products should be reported promptly with supporting photos.</p>
            </div>
          </div>
        </section>

        {/* Rest of the clauses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Copyright className="w-5 h-5 text-slate-500" /> 12. Intellectual Property</h3>
            <p className="text-sm text-muted-foreground mb-3">NOVA's branding, software, design, and text are protected. You may not reproduce or exploit them.</p>
            <p className="text-sm text-muted-foreground">Sellers must ensure their uploaded content does not infringe the rights of others.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><AlertOctagon className="w-5 h-5 text-red-500" /> 13. Prohibited Use</h3>
            <p className="text-sm text-muted-foreground">You may not commit fraud, sell illegal goods, impersonate others, hack systems, distribute malware, violate laws, or manipulate reviews.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-500" /> 14. Reviews</h3>
            <p className="text-sm text-muted-foreground">User-submitted reviews must be accurate, relevant, lawful, and not abusive. NOVA may remove violating content.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-500" /> 15. Third-Party Services</h3>
            <p className="text-sm text-muted-foreground">NOVA integrates with third parties (payments, DB, shipping). They operate under their own terms and privacy policies.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-500" /> 16. Liability & 20. Law</h3>
            <p className="text-sm text-muted-foreground">NOVA limits liability for indirect damages (profits, data, interruptions) where permitted. Governing law and dispute resolution depend on location and applicable law.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> 17. Product Disputes</h3>
            <p className="text-sm text-muted-foreground">Product disputes (quality, shipping, refunds, warranty) should generally be raised directly with the seller first.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-emerald-500" /> 18. Changes to Terms</h3>
            <p className="text-sm text-muted-foreground">Terms may be updated to reflect new features, laws, or policies. Major changes will be notified via email or website banner.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10 sm:col-span-2">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Power className="w-5 h-5 text-red-500" /> 19. Termination</h3>
            <p className="text-sm text-muted-foreground">You may stop using NOVA at any time. NOVA may suspend or terminate access when permitted. Obligations existing prior to termination (like payments) survive termination.</p>
          </div>
        </div>

        {/* 21. Contact NOVA */}
        <section className="text-center py-12 border-t border-slate-200 dark:border-slate-800">
          <Mail className="w-10 h-10 mx-auto text-accent-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">21. Contact NOVA</h2>
          <p className="text-muted-foreground mb-8">If you have questions regarding these Terms & Conditions, marketplace policies, orders, or seller responsibilities, our support team is available to assist.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="w-full sm:w-auto px-8 py-3.5 bg-accent-primary text-white font-medium rounded-xl hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20">
              Contact NOVA Support
            </Link>
            <Link href="/account/orders" className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              View My Orders
            </Link>
          </div>
          
          <div className="mt-12 space-y-2">
            <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">NOVA</p>
            <p className="text-sm text-muted-foreground">Premium Shopping. Independent Sellers. One Marketplace.</p>
            <p className="text-xs text-muted-foreground italic">By continuing to use NOVA, you acknowledge that you have read and understood these Terms & Conditions.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
