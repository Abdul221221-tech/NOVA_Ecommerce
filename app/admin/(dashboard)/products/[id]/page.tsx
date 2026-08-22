import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Store, Box, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductApprovalControls } from './ProductApprovalControls'

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      stores ( name, slug, status )
    `)
    .eq('id', id)
    .single()

  if (!product) notFound()

  const store = product.stores as any

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-3">
            {product.name}
            <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
              product.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              product.approval_status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {product.approval_status || 'approved'}
            </span>
            <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
              product.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              product.status === 'draft' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
              'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
              {product.status}
            </span>
          </h1>
          <p className="text-slate-400 mt-1">Review and manage product listing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Package className="w-5 h-5 text-fuchsia-400" /> Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Price</span>
                  <span className="text-white text-lg font-bold text-emerald-400">${product.price.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Compare at Price</span>
                  <span className="text-white text-lg line-through text-slate-400">{product.compare_at_price ? `$${product.compare_at_price.toFixed(2)}` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Stock Level</span>
                  <span className="text-white text-lg font-bold">{product.stock}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">SKU</span>
                  <span className="text-white font-mono bg-slate-950 px-2 py-1 rounded">{product.sku || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Created At</span>
                  <span className="text-white">{new Date(product.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 text-sm">Description</span>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-white/5 whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
              </div>

              {product.images && product.images.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-2 text-sm">Images</span>
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img: string, i: number) => (
                      <div key={i} className="aspect-square bg-slate-950 rounded-lg border border-white/5 overflow-hidden relative">
                        <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Store className="w-5 h-5 text-amber-400" /> Seller Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Store Name</span>
                <span className="text-white font-medium">{store.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Store Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  store.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  store.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>{store.status}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-white/5">
                <Link href={`/admin/sellers/${product.store_id}`} className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium flex items-center gap-1">
                  View full store profile &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>

          <ProductApprovalControls product={product} />

          {product.rejection_reason && (
            <Card className="bg-red-500/5 border-red-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2 text-sm"><ShieldAlert className="w-4 h-4" /> Rejection Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <span className="text-red-400/70 block mb-1 text-xs uppercase font-bold tracking-wider">Reason</span>
                  <p className="text-white bg-red-500/10 p-3 rounded-lg border border-red-500/20">{product.rejection_reason}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
