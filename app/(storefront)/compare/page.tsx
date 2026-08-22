'use client'

import { useStorefront } from '@/components/storefront/StorefrontProvider'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function ComparePage() {
  const { compareList, removeFromCompare } = useStorefront()

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg min-h-[60vh]">
        <h1 className="text-3xl font-heading font-bold mb-4">Product Comparison</h1>
        <p className="text-muted-foreground mb-8">You haven't added any products to compare.</p>
        <Link href="/" className="text-accent-primary hover:underline">
          Go back to shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen overflow-x-auto pb-48">
      <h1 className="text-3xl font-heading font-bold mb-8">Compare Products</h1>
      
      <div className="min-w-[800px] bg-surface-base border border-border/50 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-6 border-b border-r bg-muted/10 w-48 text-left font-semibold text-muted-foreground align-bottom">
                <span className="text-sm uppercase tracking-wider">Product Features</span>
              </th>
              {compareList.map(product => (
                <th key={product.id} className="p-6 border-b border-r last:border-r-0 w-64 align-top bg-surface-base">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/10 mb-4 border shadow-sm group">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.title} fill className="object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No img</div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-3">
                    <Link href={`/products/${product.id}`} className="hover:text-accent-primary hover:underline transition-colors">
                      {product.title}
                    </Link>
                  </h3>
                  <Button variant="outline" size="sm" className="text-destructive h-9 px-3 w-full mt-auto hover:bg-destructive hover:text-white transition-colors" onClick={() => removeFromCompare(product.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </th>
              ))}
              {/* Fill empty columns up to 4 */}
              {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                <th key={`empty-${i}`} className="p-6 border-b border-r last:border-r-0 w-64 bg-muted/5">
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium border-2 border-dashed rounded-xl p-8">
                    Add another to compare
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-muted/5 transition-colors">
              <td className="p-5 border-b border-r font-medium text-muted-foreground">Price</td>
              {compareList.map(product => (
                <td key={product.id} className="p-5 border-b border-r last:border-r-0 text-xl font-bold text-foreground">₹{product.price.toLocaleString('en-IN')}</td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, i) => <td key={i} className="border-b border-r last:border-r-0 bg-muted/5"></td>)}
            </tr>
            <tr className="hover:bg-muted/5 transition-colors">
              <td className="p-5 border-b border-r font-medium text-muted-foreground">Brand / Store</td>
              {compareList.map(product => (
                <td key={product.id} className="p-5 border-b border-r last:border-r-0">
                  {product.storeName ? (
                    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-accent-primary/10 text-accent-primary">
                      {product.storeName}
                    </span>
                  ) : <span className="text-muted-foreground italic text-sm">Unknown</span>}
                </td>
              ))}
              {Array.from({ length: 4 - compareList.length }).map((_, i) => <td key={i} className="border-b border-r last:border-r-0 bg-muted/5"></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
