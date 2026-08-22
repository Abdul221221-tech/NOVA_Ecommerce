import Link from 'next/link'
import { PackageX, ArrowRight } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
        <PackageX className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-bold font-heading mb-4">Product Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        We couldn't find the product you're looking for. It may have been removed, or the link might be incorrect.
      </p>
      <Link href="/products" className="bg-foreground text-background hover:bg-foreground/90 transition-colors px-8 py-3.5 rounded-full font-bold flex items-center justify-center">
        Explore Products <ArrowRight className="ml-2 w-4 h-4" />
      </Link>
    </div>
  )
}
