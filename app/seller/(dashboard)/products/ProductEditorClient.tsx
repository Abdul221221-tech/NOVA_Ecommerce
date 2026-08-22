'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { upsertProduct, ProductPayload } from '@/app/actions/product'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { UploadCloud, CheckCircle2, Loader2, GripVertical, Trash2 } from 'lucide-react'

export default function ProductEditorClient({ 
  initialData,
  categories: initialCategories = []
}: { 
  initialData?: any,
  categories?: any[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [categories, setCategories] = useState<any[]>(initialCategories)

  // Form State
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [experienceStory, setExperienceStory] = useState(initialData?.experience_story || '')
  const [brand, setBrand] = useState(initialData?.brand || '')
  const [price, setPrice] = useState(initialData?.price || '')
  const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compare_at_price || '')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(initialData?.status || 'draft')
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
  const [isNewArrival, setIsNewArrival] = useState<boolean>(initialData?.is_new_arrival ?? false)
  const [isComingSoon, setIsComingSoon] = useState<boolean>(initialData?.is_coming_soon ?? false)
  
  // Variants State
  const [variants, setVariants] = useState<any[]>(initialData?.product_variants || [{ sku: '', size: '', color: '', price_override: '', stock_quantity: 0 }])
  const [skuError, setSkuError] = useState('')

  // Images & 3D Model State
  const [images, setImages] = useState<any[]>(initialData?.product_images?.sort((a:any, b:any) => a.sort_order - b.sort_order) || [])
  const [modelUrl, setModelUrl] = useState<string>(initialData?.model_url || '')
  const [isUploadingModel, setIsUploadingModel] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Computed Discount
  const priceNum = parseFloat(price.toString()) || 0
  const compareNum = parseFloat(compareAtPrice.toString()) || 0
  const discountPercent = compareNum > priceNum ? Math.round(((compareNum - priceNum) / compareNum) * 100) : 0

  const handleAddVariant = () => {
    setVariants([...variants, { sku: '', size: '', color: '', price_override: '', stock_quantity: 0 }])
  }

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const processImageFile = async (file: File, index: number) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    
    // Optimistic UI - Add temporary image at specific slot
    const tempUrl = URL.createObjectURL(file)
    const newImageObj = { id: Math.random().toString(), url: tempUrl, sort_order: index, uploading: true }
    
    setImages(prev => {
      const next = [...prev]
      next[index] = newImageObj
      return next
    })
    
    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
    if (!uploadError) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      // Replace temporary with actual
      setImages(prev => {
        const next = [...prev]
        if (next[index] && next[index].id === newImageObj.id) {
          next[index] = { ...next[index], url: data.publicUrl, uploading: false }
        }
        return next
      })
    } else {
      // Remove temporary on error
      setImageError(`Failed to upload Image ${index + 1}. Please try again.`)
      setImages(prev => {
        const next = [...prev]
        if (next[index] && next[index].id === newImageObj.id) {
          next[index] = undefined
        }
        return next
      })
    }
  }

  const [imageError, setImageError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Unused
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploadingModel(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsUploadingModel(false)
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage.from('product-models').upload(fileName, file)
    if (!uploadError) {
      const { data } = supabase.storage.from('product-models').getPublicUrl(fileName)
      setModelUrl(data.publicUrl)
    }
    setIsUploadingModel(false)
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === images.length - 1) return
    
    const newImages = [...images]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newImages[targetIndex]
    newImages[targetIndex] = newImages[index]
    newImages[index] = temp
    
    newImages.forEach((img, i) => img.sort_order = i)
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = [...prev]
      next[index] = undefined
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSkuError('')
    setImageError('')
    
    if (images.filter(Boolean).length < 3) {
      setImageError('Please upload at least 3 images for this product.')
      return
    }

    const skus = variants.map(v => v.sku).filter(Boolean)
    if (new Set(skus).size !== skus.length) {
      setSkuError('All variants must have a unique SKU within this product.')
      return
    }

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const payload: ProductPayload = {
        id: initialData?.id,
        title,
        description,
        experience_story: experienceStory || null,
        brand: brand || null,
        price: priceNum,
        compare_at_price: compareNum > 0 ? compareNum : null,
        status,
        category_id: categoryId || null,
        is_new_arrival: isNewArrival,
        is_coming_soon: isComingSoon,
        variants: variants.map(v => ({
          id: v.id,
          sku: v.sku,
          size: v.size || null,
          color: v.color || null,
          price_override: v.price_override ? parseFloat(v.price_override.toString()) : null,
          stock_quantity: parseInt(v.stock_quantity.toString()) || 0
        })),
        images: images.filter(Boolean).map(({ uploading, ...img }, i) => ({ ...img, sort_order: i })), // clean out UI state
        model_url: modelUrl || null
      }

      await upsertProduct(payload)
      setSubmitSuccess(true)
      setTimeout(() => {
        router.push('/seller/products')
      }, 1000)
    } catch (error) {
      console.error(error)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-50 bg-surface-base/80 backdrop-blur-md p-4 -mx-4 rounded-b-xl border-b shadow-sm">
        <h1 className="font-heading text-3xl font-bold">{initialData ? 'Edit Product' : 'New Product'}</h1>
        <div className="space-x-4 flex items-center">
          <Button type="button" variant="outline" onClick={() => router.push('/seller/products')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || submitSuccess} className="w-[140px] relative overflow-hidden transition-all duration-300">
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center justify-center text-emerald-400 gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Saved</span>
                </motion.div>
              ) : isSubmitting ? (
                <motion.div
                  key="submitting"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  Save Product
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="md:col-span-2 space-y-8">
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:border-accent-primary/50 focus-within:ring-1 focus-within:ring-accent-primary/20">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b"><CardTitle>Basic Details</CardTitle></CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2 group">
                <Label htmlFor="title" className="text-muted-foreground group-focus-within:text-accent-primary transition-colors">Title</Label>
                <Input id="title" required value={title} onChange={e => setTitle(e.target.value)} className="focus-visible:ring-accent-primary" />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="brand" className="text-muted-foreground group-focus-within:text-accent-primary transition-colors">Brand (Optional)</Label>
                <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Nike, Apple" className="focus-visible:ring-accent-primary" />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="description" className="text-muted-foreground group-focus-within:text-accent-primary transition-colors">Description</Label>
                <Textarea id="description" rows={5} value={description} onChange={e => setDescription(e.target.value)} className="focus-visible:ring-accent-primary resize-none" />
              </div>
              <div className="space-y-2 pt-2 group">
                <Label htmlFor="experience_story" className="flex items-center gap-2 text-muted-foreground group-focus-within:text-accent-primary transition-colors">
                  Experience Story (Optional) <span className="text-[10px] uppercase tracking-wider font-bold bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded">AI Assisted</span>
                </Label>
                <p className="text-xs text-muted-foreground/70">Describe the feeling of using this product. If left blank, AI will auto-generate one.</p>
                <Textarea id="experience_story" rows={3} value={experienceStory} onChange={e => setExperienceStory(e.target.value)} placeholder="Experience everyday comfort and effortless style with this product..." className="focus-visible:ring-accent-primary resize-none" />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:border-accent-primary/50 focus-within:ring-1 focus-within:ring-accent-primary/20">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b"><CardTitle>Variants</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-6">
              <AnimatePresence>
                {skuError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-status-error bg-status-error/10 p-3 rounded-md">
                    {skuError}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {variants.map((variant, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-end border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl relative group focus-within:border-accent-primary/30 transition-colors"
                    >
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</Label>
                        <Input required value={variant.sku} onChange={e => handleVariantChange(index, 'sku', e.target.value)} className="focus-visible:ring-accent-primary bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</Label>
                        <Input value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} placeholder="e.g. L" className="focus-visible:ring-accent-primary bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</Label>
                        <Input value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} placeholder="e.g. Red" className="focus-visible:ring-accent-primary bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</Label>
                        <Input type="number" required value={variant.stock_quantity} onChange={e => handleVariantChange(index, 'stock_quantity', e.target.value)} className="focus-visible:ring-accent-primary bg-background" />
                      </div>
                      {variants.length > 1 && (
                        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex justify-end">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(index)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <Button type="button" variant="outline" onClick={handleAddVariant} className="w-full border-dashed border-2 hover:border-accent-primary hover:text-accent-primary transition-colors mt-2">
                + Add Variant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b"><CardTitle>Status & Category</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger className="focus:ring-accent-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="focus:ring-accent-primary"><SelectValue placeholder="Select category..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2 group">
                <Label className="text-muted-foreground group-focus-within:text-accent-primary transition-colors">Selling Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="pl-7 focus-visible:ring-accent-primary text-lg font-bold" />
                </div>
              </div>
              <div className="space-y-2 group">
                <Label className="flex justify-between items-end text-muted-foreground group-focus-within:text-accent-primary transition-colors">
                  <span>Compare at Price</span>
                  <AnimatePresence>
                    {discountPercent > 0 && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full"
                      >
                        {discountPercent}% OFF
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input type="number" step="0.01" value={compareAtPrice} onChange={e => setCompareAtPrice(e.target.value)} className="pl-7 focus-visible:ring-accent-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => {
                  const img = images[index]
                  return (
                    <div 
                      key={index}
                      className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 flex flex-col items-center justify-center text-center h-40 ${
                        img ? 'border-slate-100 dark:border-slate-800 bg-background' : 'border-slate-200 dark:border-slate-800 hover:border-accent-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer'
                      }`}
                    >
                      {!img ? (
                        <>
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              await processImageFile(e.target.files[0], index);
                              e.target.value = '';
                            }} 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                          <UploadCloud className="w-6 h-6 mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Image {index + 1}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {index === 0 ? 'Primary Cover' : 'Gallery Image'}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 rounded-lg overflow-hidden p-1">
                            <div className="relative w-full h-full rounded-md overflow-hidden bg-muted">
                              <Image src={img.url} alt="" fill className={`object-cover ${img.uploading ? 'opacity-50 grayscale' : ''}`} />
                              {img.uploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 animate-spin text-white drop-shadow-md" />
                                </div>
                              )}
                            </div>
                          </div>
                          <button 
                            type="button" 
                            className="absolute -top-2 -right-2 bg-background border shadow-sm p-1.5 hover:bg-destructive/10 text-destructive rounded-full z-10 transition-colors" 
                            onClick={() => removeImage(index)}
                            disabled={img.uploading}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-center border shadow-sm">
                            Image {index + 1}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              <AnimatePresence>
                {imageError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm font-medium text-status-error bg-status-error/10 p-3 rounded-md mt-4">
                    {imageError}
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
              <CardTitle>3D Model (AR)</CardTitle>
              <CardDescription>Upload a .glb or .gltf file to enable 360° and AR view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Input type="file" accept=".glb,.gltf" onChange={handleModelUpload} disabled={isUploadingModel} className="focus-visible:ring-accent-primary" />
              {isUploadingModel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading model...
                </div>
              )}
              {modelUrl && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-md border flex justify-between items-center">
                  <span className="text-sm font-medium truncate flex-1 text-accent-primary">Model attached successfully</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setModelUrl('')} className="text-destructive hover:text-destructive hover:bg-destructive/10">Remove</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
