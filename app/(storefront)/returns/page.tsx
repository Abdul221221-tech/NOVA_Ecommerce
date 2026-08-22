import { Metadata } from 'next'
import Link from 'next/link'
import { RefreshCcw, ShieldCheck, AlertCircle, Phone, PackageX, CreditCard, RotateCcw, Box, Globe, HelpCircle, CheckCircle2, ListChecks } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns & Refunds | NOVA',
  description: 'Learn about NOVA returns and refund policies, return eligibility, and how to request an exchange or refund.',
}

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 max-w-4xl py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Returns & Refunds</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          At NOVA, we want you to feel confident every time you shop with us. If your purchase isn't right for you, eligible items may be returned according to the seller's return policy and NOVA's marketplace guidelines.
        </p>
        <p className="text-sm mt-4 font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 inline-block px-6 py-3 rounded-xl border border-slate-100 dark:border-slate-800">
          Because NOVA is a multi-vendor marketplace, return eligibility, return windows, and refund conditions can vary by seller and product.
        </p>
      </div>
      
      <div className="space-y-12">
        {/* Quick Return Information */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
            <RefreshCcw className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Return Window</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200/70">Check Product Policy. Return eligibility depends on the product and seller.</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Refund</h3>
            <p className="text-sm text-emerald-800 dark:text-emerald-200/70">Secure & Transparent. Eligible refunds are processed after the returned item is received and inspected.</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-900/30">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Damaged Items</h3>
            <p className="text-sm text-red-800 dark:text-red-200/70">Report Within 48 Hours. Contact the seller as soon as possible with photos and order details.</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30">
            <Phone className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Support</h3>
            <p className="text-sm text-purple-800 dark:text-purple-200/70">We're Here to Help. Our support team can assist with return and refund issues.</p>
          </div>
        </section>

        {/* How Returns Work */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <ListChecks className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How Returns Work</h2>
          </div>
          <p className="text-muted-foreground mb-8">Returning an eligible product through NOVA is simple.</p>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
            {[
              { num: '01', title: 'Request a Return', desc: 'Open your NOVA Account → Orders, select the relevant order, and choose Request Return if the product is eligible.' },
              { num: '02', title: 'Select a Reason', desc: 'Choose the reason for your return and provide any requested information or photographs.' },
              { num: '03', title: 'Seller Review', desc: 'The seller reviews the return request and confirms the next steps.' },
              { num: '04', title: 'Return the Product', desc: 'Follow the provided return instructions and securely package the product.' },
              { num: '05', title: 'Inspection', desc: 'Once the seller receives the returned item, it may be inspected to confirm that it meets the return conditions.' },
              { num: '06', title: 'Refund', desc: 'If the return is approved, your eligible refund will be processed according to the applicable payment and seller policy.' }
            ].map((step, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-accent-primary text-white font-bold shrink-0 md:order-1 md:group-odd:-ml-5 md:group-even:-mr-5 shadow-sm z-10">
                  {step.num}
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Return Eligibility */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Return Eligibility</h2>
            </div>
            <p className="text-muted-foreground mb-4">A product may be eligible for return when:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>It is within the seller's stated return period.</li>
              <li>The product is unused or in acceptable condition.</li>
              <li>Original packaging is retained where required.</li>
              <li>Tags, accessories, manuals, or other included items are returned where applicable.</li>
              <li>The product matches the order being returned.</li>
              <li>The return reason meets the seller's return conditions.</li>
            </ul>
            <p className="text-sm font-medium text-slate-900 dark:text-white bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl">
              <strong>Important:</strong> Return eligibility is determined according to the applicable seller and product policy. Always check the return information displayed on the product page before purchasing.
            </p>
          </section>

          {/* Products That May Not Be Returnable */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
                <PackageX className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Non-Returnable Items</h2>
            </div>
            <p className="text-muted-foreground mb-4">Certain products may have limited or no return eligibility because of their nature. Examples may include:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Personalized or customized products</li>
              <li>Made-to-order products</li>
              <li>Certain hygiene-sensitive products</li>
              <li>Perishable products</li>
              <li>Products with altered or damaged packaging</li>
              <li>Items specifically marked Non-Returnable</li>
              <li>Products restricted by applicable law or seller policy</li>
            </ul>
            <p className="text-sm text-muted-foreground italic">
              The applicable return policy should be checked on the product page before placing your order.
            </p>
          </section>
        </div>

        {/* Damaged, Defective or Incorrect Items */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Damaged, Defective or Incorrect Items</h2>
              </div>
              <p className="text-muted-foreground mb-4">If your product arrives damaged, defective, incorrect, or is missing parts, please contact the seller as soon as possible.</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-4 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-900/50">
                For damaged products, we recommend reporting the issue within 48 hours of delivery. Keeping the original packaging can help the seller investigate the issue.
              </p>
            </div>
            <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-3">What to provide:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Order number</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Product name</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Clear photos of the product</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Photos of the packaging</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Description of the issue</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Any relevant delivery information</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Refunds */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Refunds</h2>
            </div>
            <p className="text-muted-foreground mb-4">Once an eligible return is received and approved, the refund process will begin. The refund amount may depend on:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-6 text-sm">
              <li>The product price</li>
              <li>Applicable shipping charges</li>
              <li>Seller return policy</li>
              <li>Reason for return</li>
              <li>Condition of the returned product</li>
              <li>Applicable taxes, fees, or deductions</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Refunds are generally sent back to the original payment method, where supported. The time required for the refund to appear in your account may depend on your bank, card issuer, payment provider, or other financial institution.
            </p>
          </section>

          <div className="space-y-8">
            {/* Return Shipping */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/10 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Box className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Return Shipping</h2>
              </div>
              <p className="text-muted-foreground mb-4 text-sm">Return shipping arrangements can vary depending on the reason for the return and the seller's policy.</p>
              
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Seller-Fault Issues</h3>
              <p className="text-sm text-muted-foreground mb-4">For issues such as wrong product received, damaged product, defective product, or missing components, the seller may provide return instructions or cover applicable return shipping costs, subject to verification.</p>
              
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Change of Mind</h3>
              <p className="text-sm text-muted-foreground">If you simply no longer want the product, return shipping may be the customer's responsibility where permitted by the seller's policy.</p>
            </section>
          </div>
        </div>

        {/* Exchanges */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Exchanges</h2>
          </div>
          <p className="text-muted-foreground mb-6">Some sellers may offer product exchanges instead of refunds.</p>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Exchange availability depends on:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Seller policy', 'Product availability', 'Product type', 'Size or variant availability', 'Condition of returned item'].map(item => (
                <span key={item} className="px-3 py-1 bg-white dark:bg-slate-900 text-sm rounded-full border border-slate-200 dark:border-slate-700">{item}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">If an exchange is unavailable, an eligible refund may be offered instead.</p>
          </div>
        </section>

        {/* Status, Cancellation, International */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-accent-primary" /> Return Status</h3>
            <p className="text-sm text-muted-foreground mb-4">You can monitor your return from your NOVA account: <br/><strong>Orders → Select Order → Return Status</strong></p>
            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">Statuses: Requested → Review → Approved → Shipped → Received → Inspected → Refunded</p>
            <Link href="/account/orders" className="text-sm font-semibold text-accent-primary hover:underline">View My Orders &rarr;</Link>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Cancellation</h3>
            <p className="text-sm text-muted-foreground mb-4">If you want to cancel an order, submit the request as soon as possible. Cancellation may not be possible once the seller has processed or shipped the order.</p>
            <p className="text-sm text-muted-foreground">If accepted, the refund will be processed according to the policy.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-white/10">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-500" /> International</h3>
            <p className="text-sm text-muted-foreground">International returns may require additional processing time and involve customs procedures, extra shipping time, import requirements, local taxes, or shipping charges depending on the seller.</p>
          </div>
        </div>

        {/* FAQ */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { q: 'How do I request a return?', a: 'Go to Account → Orders, select your order, and choose the return option if the product is eligible.' },
              { q: 'How long do I have to return an item?', a: 'The return period depends on the seller and product. Check the return policy displayed on the product page or your order details.' },
              { q: 'Can I return a customized product?', a: 'Customized and made-to-order products may not be eligible for return unless the seller\'s policy specifically allows it or the item is defective, damaged, or incorrect.' },
              { q: 'What if I received the wrong product?', a: 'Contact the seller through your order page and provide your order details and clear photographs of the product you received.' },
              { q: 'What if my item is damaged?', a: 'Take clear photos of the product and packaging and report the issue as soon as possible, preferably within 48 hours of delivery.' },
              { q: 'When will I receive my refund?', a: 'After an approved return is received and processed, the refund is initiated. The time it takes to appear in your account depends on the payment provider or financial institution.' },
              { q: 'Can I exchange an item?', a: 'Some sellers offer exchanges. Availability depends on the product, seller, and available inventory.' },
              { q: 'Can I cancel my order?', a: 'You can request cancellation before the order is processed or shipped. Cancellation is not guaranteed after fulfillment has started.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Help */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Need Help With a Return?</h2>
          <p className="text-muted-foreground mb-8">We're here to help you resolve your return or refund issue.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/account/orders" className="w-full sm:w-auto px-8 py-3.5 bg-accent-primary text-white font-medium rounded-xl hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20">
              View My Orders
            </Link>
            <Link href="/contact" className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Contact NOVA Support
            </Link>
          </div>
          <p className="mt-12 text-sm font-bold tracking-widest text-muted-foreground uppercase">
            NOVA &mdash; Shop With Confidence.
          </p>
        </div>
      </div>
    </div>
  )
}
