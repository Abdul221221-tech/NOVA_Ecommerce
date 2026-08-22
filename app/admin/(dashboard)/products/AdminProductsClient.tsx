'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight, Package, Store } from 'lucide-react'
import Link from 'next/link'

type ProductStore = {
  id: string
  name: string
  price: number
  stock: number
  approval_status: string
  status: string
  created_at: string
  stores: { name: string } | null
}

export function AdminProductsClient({ initialProducts }: { initialProducts: ProductStore[] }) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredProducts = initialProducts.filter(product => {
    const matchesTab = activeTab === 'all' ? true : product.approval_status === activeTab
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.stores?.name.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-slate-900 border border-white/5">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search products or stores..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 border border-white/5 rounded-xl">
            <p className="text-slate-400">No products found.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <Link key={product.id} href={`/admin/products/${product.id}`}>
              <Card className="bg-slate-900/50 border-white/5 hover:border-fuchsia-500/50 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-fuchsia-500/30 transition-colors">
                      <Package className="w-5 h-5 text-slate-400 group-hover:text-fuchsia-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {product.name}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          product.approval_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          product.approval_status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {product.approval_status || 'approved'}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          product.status === 'active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          product.status === 'draft' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                          'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {product.status}
                        </span>
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">${product.price.toFixed(2)}</span>
                        <span className="flex items-center gap-1"><Store className="w-3 h-3" /> {product.stores?.name}</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
