import { Metadata } from 'next'
import Link from 'next/link'
import { Truck, Package, Clock, CreditCard, Gift, MapPin, AlertTriangle, ShieldCheck, HelpCircle, Globe, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping Information | NOVA',
  description: 'Learn about NOVA shipping policies, delivery times, tracking, and multi-vendor delivery process.',
}

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 max-w-4xl py-16 md:py-24">
      <div className="text-center mb-16">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Shipping Information</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          At NOVA, we want your shopping experience to be simple, transparent, and reliable. Because NOVA is a multi-vendor marketplace, shipping and delivery may vary depending on the seller, product type, destination, and order size.
        </p>
      </div>
      
      <div className="space-y-12">
        {/* How Shipping Works */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. How Shipping Works</h2>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">Order Confirmation & Verification</h3>
          <p className="text-muted-foreground mb-4">Once you successfully place an order, your order is securely processed and verified. After verification:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-8">
            <li>Your order is forwarded to the respective independent seller.</li>
            <li>The seller prepares and packages your item for shipment.</li>
            <li>You receive an order confirmation with your order details.</li>
            <li>Once the package is dispatched, tracking information becomes available.</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3">Multi-Seller Orders</h3>
          <p className="text-muted-foreground mb-4">
            NOVA brings together products from multiple independent sellers. If your order contains products from different sellers, your items may be:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Shipped separately</li>
            <li>Delivered in multiple packages</li>
            <li>Delivered on different dates</li>
            <li>Assigned separate tracking numbers</li>
          </ul>
          <p className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
            You do not need to place separate orders. NOVA automatically manages the individual shipments associated with your order.
          </p>
        </section>

        {/* Delivery Estimates */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Delivery Estimates</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Delivery time depends on the seller's location, your delivery address, product availability, and the shipping method selected.
          </p>
          
          <div className="overflow-x-auto mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Shipping Type</th>
                  <th className="py-4 px-4 font-semibold text-slate-900 dark:text-white">Estimated Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-2">🇮🇳 Domestic Shipping</td>
                  <td className="py-4 px-4 text-muted-foreground">3–5 business days</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-2">🌎 International Shipping</td>
                  <td className="py-4 px-4 text-muted-foreground">7–14 business days</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4 flex items-center gap-2">🛠️ Custom / Made-to-Order</td>
                  <td className="py-4 px-4 text-muted-foreground">Additional 1–2 weeks processing</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm italic text-muted-foreground mb-6">
            Please note: Delivery estimates are approximate and may vary depending on the seller and courier service.
          </p>

          <h3 className="text-lg font-semibold mb-3">Processing Time</h3>
          <p className="text-muted-foreground mb-2">
            Some products require additional preparation before dispatch. Custom, personalized, handmade, or made-to-order products may require additional processing time.
          </p>
          <p className="text-muted-foreground">
            The estimated processing time will be displayed on the relevant product page whenever applicable.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Charges */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shipping Charges</h2>
            </div>
            <p className="text-muted-foreground mb-4">Shipping charges are calculated automatically during checkout. The final shipping cost may depend on:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Product weight</li>
              <li>Package dimensions</li>
              <li>Delivery destination</li>
              <li>Number of items</li>
              <li>Seller location</li>
              <li>Selected shipping method</li>
            </ul>
          </section>

          {/* Free Shipping */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl">
                <Gift className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Free Shipping</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              NOVA offers free domestic shipping automatically when your merchandise subtotal from a single store reaches <strong>₹500</strong> or more.
            </p>
            <p className="text-muted-foreground">
              Because NOVA is a multi-vendor marketplace, this threshold is calculated separately for each store in your cart. For store orders under ₹500, a standard shipping fee of ₹40 applies.
            </p>
          </section>
        </div>

        {/* Track Your Order */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Track Your Order</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Once your order has been shipped, you will receive a shipping confirmation containing your tracking information. You can also track your order from your NOVA account.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mb-6">
            <p className="font-semibold mb-2">To track your order:</p>
            <p className="text-muted-foreground">NOVA Account → Orders → Select Order → Track Order</p>
          </div>

          <p className="font-semibold mb-3">Your tracking page may show:</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {['Order confirmed', 'Processing', 'Packed', 'Shipped', 'In transit', 'Out for delivery', 'Delivered'].map(status => (
              <span key={status} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-sm rounded-full">{status}</span>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/account/orders" className="inline-flex items-center justify-center px-6 py-3 bg-accent-primary text-white font-medium rounded-xl hover:bg-accent-primary/90 transition-colors">
              View Your Orders
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Tracking information may take some time to appear after the seller hands the package to the courier.
            </p>
          </div>
        </section>

        {/* Delays & Delivery Issues */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Delays & Delivery Issues</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Although we work to provide reliable delivery estimates, unexpected delays can occasionally occur. Possible causes include:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-8 text-muted-foreground list-disc pl-6">
            <li className="list-item">Severe weather</li>
            <li className="list-item">Courier delays</li>
            <li className="list-item">High-volume shipping periods</li>
            <li className="list-item">Incorrect or incomplete address information</li>
            <li className="list-item">Customs processing</li>
            <li className="list-item">Public holidays</li>
            <li className="list-item">Unexpected transportation issues</li>
            <li className="list-item">Seller processing delays</li>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
            <p className="mb-4">
              If your package is significantly delayed, first check the latest tracking information from your NOVA account. If you need further assistance, you can contact the seller through your order page or contact NOVA Support.
            </p>
            <Link href="/contact" className="inline-flex items-center font-semibold text-accent-primary hover:underline">
              Contact NOVA Support &rarr;
            </Link>
          </div>
        </section>

        {/* Lost or Damaged Packages */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl">
              <Package className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lost or Damaged Packages</h2>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-3 text-red-500">Damaged Package</h3>
              <p className="text-muted-foreground mb-3">If your package arrives damaged:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Do not immediately discard the packaging.</li>
                <li>Take clear photographs of the package.</li>
                <li>Photograph the damaged product from multiple angles.</li>
                <li>Keep the shipping label visible in at least one photograph.</li>
                <li>Contact the seller through your NOVA order page.</li>
                <li>Submit the required details as soon as possible.</li>
              </ul>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                For faster assistance, we recommend reporting damaged items within 48 hours of delivery.
              </p>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            <div>
              <h3 className="text-lg font-bold mb-3">Missing Package</h3>
              <p className="text-muted-foreground mb-3">If your order is marked as Delivered but you cannot find the package, first check:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                <li>Your front door or designated delivery area</li>
                <li>With family members or household members</li>
                <li>With neighbors</li>
                <li>Your building reception/security desk</li>
                <li>Your local post office or courier service</li>
              </ul>
              <p className="font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                If the package is still missing after checking these locations, contact the seller or NOVA Support with your order and tracking information.
              </p>
            </div>
          </div>
        </section>

        {/* International Shipping & Address Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-2xl">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">International Shipping</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              International orders may require additional time due to customs and local delivery procedures.
            </p>
            <p className="text-muted-foreground mb-4">
              Depending on the destination, additional charges such as customs duties, import taxes, or other local fees may apply.
            </p>
            <p className="text-muted-foreground">
              International delivery times can also vary depending on the destination country's customs process.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Your Address</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Before completing your purchase, carefully review your shipping address to ensure it includes your full name, street address, city, state/province, postal/ZIP code, and phone number.
            </p>
            <p className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
              NOVA and its sellers may not be responsible for delays caused by incorrect or incomplete shipping information provided during checkout.
            </p>
          </section>
        </div>

        {/* Our Commitment */}
        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 md:p-8 md:p-12 text-white shadow-lg text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-6 text-white/90" />
          <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            NOVA works with independent sellers and shipping partners to provide a smooth and transparent delivery experience.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Secure Packaging', 'Reliable Tracking', 'Transparent Shipping', 'Seller Support', 'Customer Assistance'].map(feature => (
              <span key={feature} className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full font-medium text-sm">
                {feature}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-8 md:p-10 shadow-sm border border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { q: 'How long does domestic delivery take?', a: 'Standard domestic delivery typically takes 3–5 business days, depending on the seller and destination.' },
              { q: 'Will all items in my order arrive together?', a: 'Not necessarily. Products purchased from different sellers may be shipped separately and can arrive at different times.' },
              { q: 'When will I receive my tracking number?', a: 'You will receive tracking information after the seller dispatches your order and the courier provides tracking details.' },
              { q: 'Can I change my shipping address after placing an order?', a: 'Address changes may not be possible once an order has been processed or shipped. Contact the seller or NOVA Support as soon as possible if you entered an incorrect address.' },
              { q: 'What should I do if my package arrives damaged?', a: 'Take clear photos of the package and product and contact the seller within 48 hours of delivery.' },
              { q: 'What if my tracking says delivered but I haven\'t received my package?', a: 'Check around your delivery location, with neighbors, household members, building security, or the local courier/post office first. If you still cannot locate it, contact the seller or NOVA Support.' },
              { q: 'Does NOVA provide international shipping?', a: 'International shipping availability depends on the seller and product. Available shipping destinations and charges will be displayed during checkout.' },
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
          <h2 className="text-2xl font-bold mb-4">Need Help With Your Shipment?</h2>
          <p className="text-muted-foreground mb-8">If you have questions about your delivery, tracking, or shipping issue, we're here to help.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/account/orders" className="w-full sm:w-auto px-8 py-3.5 bg-accent-primary text-white font-medium rounded-xl hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20">
              Go to My Orders
            </Link>
            <Link href="/contact" className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Contact Support
            </Link>
          </div>
          <p className="mt-12 text-sm font-bold tracking-widest text-muted-foreground uppercase">
            NOVA &mdash; Premium Shopping. Delivered With Confidence.
          </p>
        </div>
      </div>
    </div>
  )
}
