import { Metadata } from 'next'
import Link from 'next/link'
import { Lock, User, Store, ShoppingCart, Search, Settings, CreditCard, Bot, MessageSquare, Share2, Shield, Database, Cookie, Users, Mail, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | NOVA',
  description: 'Learn how NOVA marketplace collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 max-w-4xl py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-wider">Last Updated: 19 August 2026</p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          At NOVA Marketplace, your privacy matters to us. We are committed to handling your personal information responsibly and transparently.
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
          This Privacy Policy explains what information we collect, how we use it, when it may be shared, and the measures we take to protect it when you use NOVA as a customer or seller.
        </p>
      </div>
      
      <div className="space-y-12">
        {/* Your Privacy at NOVA */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-lg text-center border border-slate-700">
          <Lock className="w-12 h-12 mx-auto mb-6 text-white/90" />
          <h2 className="text-3xl font-bold mb-4">Your Privacy at NOVA</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            We believe you should understand how your information is handled. Your information helps us:
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['Operate NOVA', 'Process Orders', 'Support Customers', 'Protect Accounts', 'Improve Your Shopping Experience'].map(feature => (
              <span key={feature} className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full font-medium text-sm">
                {feature}
              </span>
            ))}
          </div>
          <p className="text-sm text-white/70">We only use information where it is necessary to provide and improve our marketplace services.</p>
        </section>

        {/* 1. Information We Collect */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
          </div>
          <p className="text-muted-foreground mb-8">Depending on how you use NOVA, we may collect different types of information.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><User className="w-5 h-5 text-accent-primary" /> Account Information</h3>
              <p className="text-sm text-muted-foreground mb-3">When you create a NOVA account, we may collect your full name, email address, password credentials, and account role (customer or seller).</p>
              <p className="text-xs text-muted-foreground bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                Passwords and authentication credentials are securely managed through Supabase Auth rather than being stored as plain-text passwords on our application servers.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Store className="w-5 h-5 text-accent-primary" /> Seller Information</h3>
              <p className="text-sm text-muted-foreground mb-3">If you register as a seller, we collect additional information required to operate your store, including store name, description, logo, profile, and Stripe Connect account information.</p>
              <p className="text-xs text-muted-foreground bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                This allows us to display your store and support marketplace operations and payouts.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-accent-primary" /> Order & Transaction</h3>
              <p className="text-sm text-muted-foreground mb-3">When you purchase products, we collect order details, products purchased, pricing, shipping address, cart information, order status, and delivery information.</p>
              <p className="text-xs text-muted-foreground bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                Payments are processed through Stripe. NOVA does not store your raw credit card number on its own servers.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Search className="w-5 h-5 text-accent-primary" /> Shopping & Interaction</h3>
              <p className="text-sm text-muted-foreground mb-3">To improve the marketplace, we may collect info about how you interact with NOVA: products viewed, wishlist activity, reviews, search queries, and shopping preferences.</p>
              <p className="text-xs text-muted-foreground bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                This helps us improve search functionality and provide more relevant product recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
          </div>
          <p className="text-muted-foreground mb-8">We use collected information to operate and improve NOVA.</p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent-primary shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Provide Marketplace Services</h3>
                <p className="text-sm text-muted-foreground">We use your information to create and manage your account, display your profile, process orders, manage carts and wishlists, and provide marketplace functionality.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent-primary shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Process & Manage Orders</h3>
                <p className="text-sm text-muted-foreground">Your information allows us to confirm purchases, process orders, provide shipping updates, manage deliveries, handle returns and refunds, and communicate important order info.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent-primary shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Process Payments & Seller Payouts</h3>
                <p className="text-sm text-muted-foreground">Stripe is used to process customer payments and support seller payouts through Stripe Connect.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent-primary shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Improve Personalization</h3>
                <p className="text-sm text-muted-foreground">NOVA may use interaction and search information to understand search intent and improve product discovery and recommendations (e.g., using AI-powered systems to suggest products).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-accent-primary shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Customer Support</h3>
                <p className="text-sm text-muted-foreground">We may use your information to respond to support requests, investigate order issues, resolve disputes, assist with returns/refunds, and communicate account information.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How We Share Your Information */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Share2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. How We Share Your Information</h2>
          </div>
          <p className="text-muted-foreground mb-6">NOVA does not sell your personal information simply for advertising purposes. We may share information when necessary to provide our services.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3">Independent Sellers</h3>
              <p className="text-sm text-muted-foreground mb-4">When you purchase a product, the seller receives info necessary to fulfill your order: customer name, shipping address, order details, and delivery information.</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Sellers do not receive your payment card information through NOVA.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3">Technology Providers</h3>
              <p className="text-sm text-muted-foreground mb-4">We work with trusted third-parties like <strong>Stripe</strong> (payments, payouts) and <strong>Supabase</strong> (authentication, database, security).</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">These providers process information according to their applicable privacy and security practices.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg mb-3">Legal Requirements</h3>
              <p className="text-sm text-muted-foreground">We may disclose information to comply with laws, respond to legal or government requests, protect rights/safety, or detect/prevent fraud and security threats.</p>
            </div>
          </div>
        </section>

        {/* 4. Data Security */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Data Security</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Protecting your information is an important part of NOVA's platform architecture. We use appropriate technical and organizational safeguards designed to protect information from unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <ul className="space-y-4 mb-6">
            <li className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-accent-primary" />
              <span className="text-muted-foreground"><strong>Authentication Security:</strong> User authentication is securely managed through Supabase Auth.</span>
            </li>
            <li className="flex items-center gap-3">
              <Database className="w-5 h-5 text-accent-primary" />
              <span className="text-muted-foreground"><strong>Database Security:</strong> Our application uses Row Level Security (RLS) policies to restrict database access according to user authorization.</span>
            </li>
            <li className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-accent-primary" />
              <span className="text-muted-foreground"><strong>Payment Security:</strong> Payment processing is handled through Stripe. NOVA does not store raw credit card numbers on its own servers.</span>
            </li>
          </ul>
          
          <p className="text-sm italic text-muted-foreground">
            No online service can guarantee absolute security. We continuously work to maintain appropriate safeguards and protect the information entrusted to us.
          </p>
        </section>

        {/* Additional Policies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">5. Your Information & Account</h2>
            <p className="text-sm text-muted-foreground mb-4">You can manage certain information directly through your NOVA account, including profile, shipping address, orders, wishlist, and seller info.</p>
            <p className="text-sm text-muted-foreground">If you believe your account has been accessed without authorization, contact NOVA Support as soon as possible.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Cookie className="w-5 h-5 text-amber-500" /> 6. Cookies</h2>
            <p className="text-sm text-muted-foreground mb-4">NOVA may use cookies or similar technologies where necessary to keep you signed in, maintain session functionality, remember preferences, and improve performance.</p>
            <p className="text-sm text-muted-foreground">You can manage cookie settings through your browser, although disabling certain cookies may affect some functionality.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-purple-500" /> 7. AI & Recommendations</h2>
            <p className="text-sm text-muted-foreground mb-4">NOVA may use AI-powered functionality to improve product discovery, analyzing search queries to understand user intent and provide relevant results.</p>
            <p className="text-sm text-muted-foreground">AI-assisted recommendations are intended to improve your shopping experience and do not guarantee specific products will be recommended.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-blue-500" /> 8. Seller Privacy</h2>
            <p className="text-sm text-muted-foreground mb-4">Sellers may have additional information associated with their account, including store information and payment identifiers required for payouts.</p>
            <p className="text-sm text-muted-foreground">Seller info may be displayed publicly when necessary to operate the marketplace (store name, logo, description, etc.).</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">9. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground mb-4">NOVA relies on third-party services (like Stripe and Supabase) that process information necessary to provide their services. These operate under their own applicable terms and privacy policies.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-teal-500" /> 10. Children's Privacy</h2>
            <p className="text-sm text-muted-foreground">NOVA is not intentionally designed to collect personal information from children. If you believe a child has provided personal information to NOVA inappropriately, please contact us.</p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10 md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">11. Policy Updates</h2>
            <p className="text-sm text-muted-foreground mb-4">We may update this Privacy Policy from time to time to reflect changes to NOVA's services, new features, changes in technology, or legal/regulatory requirements.</p>
            <p className="text-sm text-muted-foreground">When we make significant changes, we will update the Last Updated date at the top of this page. We encourage you to review this page periodically.</p>
          </section>
        </div>

        {/* 12. Contact NOVA */}
        <section className="text-center py-12 border-t border-slate-200 dark:border-slate-800">
          <Mail className="w-10 h-10 mx-auto text-accent-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">12. Contact NOVA</h2>
          <p className="text-muted-foreground mb-2">Have a Privacy Question?</p>
          <p className="text-muted-foreground mb-8">If you have questions, concerns, or requests regarding this Privacy Policy or how your information is handled, our support team is available to help.</p>
          
          <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-accent-primary text-white font-medium rounded-xl hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20">
            Contact NOVA Support
          </Link>
          
          <div className="mt-12 space-y-2">
            <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">NOVA</p>
            <p className="text-sm text-muted-foreground">Premium Shopping. Trusted Marketplace.</p>
            <p className="text-xs text-muted-foreground italic">Your privacy and security are an important part of the NOVA experience.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
