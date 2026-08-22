'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { deleteProducts, updateProductStatuses } from '@/app/actions/product'
import { Button, buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { PackageX } from 'lucide-react'
import { EmptyState } from '@/components/seller/EmptyState'

type ProductListProps = {
  products: any[]
}

const MotionTableRow = motion(TableRow)

export default function ProductListClient({ products }: ProductListProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return
    
    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
        await deleteProducts(selectedIds)
        setSelectedIds([])
      }
    } else if (action === 'active' || action === 'draft' || action === 'archived') {
      await updateProductStatuses(selectedIds, action as any)
      setSelectedIds([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold">Products</h1>
        <Link href="/seller/products/new" className={buttonVariants({ variant: "default" })}>
          Add New Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-surface-base p-4 rounded-lg border">
        <div className="flex flex-1 gap-4">
          <Input 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs focus-visible:ring-accent-primary"
          />
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || 'all')}>
            <SelectTrigger className="w-[180px] focus:ring-accent-primary">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-muted-foreground mr-2">{selectedIds.length} selected</span>
            <Select onValueChange={(val: any) => handleBulkAction(val)}>
              <SelectTrigger className="w-[180px] focus:ring-accent-primary">
                <SelectValue placeholder="Bulk Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Set Active</SelectItem>
                <SelectItem value="draft">Set Draft</SelectItem>
                <SelectItem value="archived">Archive</SelectItem>
                <SelectItem value="delete" className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Delete</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 border-none">
                  <EmptyState 
                    icon={PackageX} 
                    title="No products found" 
                    description={search ? "We couldn't find any products matching your search." : "You haven't added any products to your store yet."}
                    actionLabel={search ? undefined : "Add your first product"}
                    actionHref={search ? undefined : "/seller/products/new"}
                  />
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => {
                  const totalStock = product.product_variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0) || 0
                  const primaryImage = product.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url
                  const delay = Math.min(index * 0.03, 0.3) // Cap stagger delay
                  
                  return (
                    <MotionTableRow 
                      key={product.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay }}
                      className="group hover:bg-accent-primary/5 transition-colors duration-200"
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedIds.includes(product.id)}
                          onCheckedChange={(c) => handleSelectOne(c as boolean, product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-md bg-muted overflow-hidden shrink-0 border relative group-hover:border-accent-primary/30 transition-colors">
                            {primaryImage ? (
                              <Image src={primaryImage} alt={product.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">No img</div>
                            )}
                          </div>
                          <div className="font-medium group-hover:text-accent-primary transition-colors">{product.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.status === 'active' ? 'default' : product.status === 'draft' ? 'outline' : 'secondary'}
                          className={product.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{product.price?.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={totalStock === 0 ? "text-muted-foreground" : ""}>{totalStock} in stock</span>
                          {totalStock === 0 ? (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4 animate-pulse">Out of Stock</Badge>
                          ) : totalStock <= 5 ? (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-status-warning border-status-warning animate-pulse">Low Stock</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/seller/products/${product.id}`} className="text-sm font-medium text-muted-foreground hover:text-accent-primary hover:underline transition-colors">
                          Edit
                        </Link>
                      </TableCell>
                    </MotionTableRow>
                  )
                })}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
