'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { placeOrder, validateCouponAction } from '@/app/actions/checkout'
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, Address, AddressInput } from '@/app/actions/addresses'
import { useStorefront } from '@/components/storefront/StorefrontProvider'
import { toast } from 'sonner'
import { Loader2, ArrowRight, MapPin, CheckCircle2, CreditCard, Wallet, Landmark, Banknote, Tag, CalendarDays, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StripePaymentModal } from './StripePaymentModal'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

interface CheckoutFlowProps {
  itemsByStore: Record<string, any>
  profile: {
    name?: string
    mobile_number?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
}

export default function CheckoutFlow({ itemsByStore, profile }: CheckoutFlowProps) {
  const [isPlacing, setIsPlacing] = useState(false)
  
  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [addressFormMode, setAddressFormMode] = useState<'list' | 'add' | 'edit'>('list')
  const [showGstDetails, setShowGstDetails] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  
  const [address, setAddress] = useState({
    name: profile?.name || '',
    mobile_number: profile?.mobile_number || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    label: 'Home',
    is_default: false
  })
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  
  const [couponCode, setCouponCode] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discountAmount: number } | null>(null)

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [stripeOrderGroupId, setStripeOrderGroupId] = useState<string | null>(null)

  const router = useRouter()
  const { refreshCart } = useStorefront()

  // Initialize Addresses
  useEffect(() => {
    async function loadAddresses() {
      setIsLoadingAddresses(true)
      const res = await getUserAddresses()
      if (res.success && res.addresses && res.addresses.length > 0) {
        setSavedAddresses(res.addresses)
        setAddressFormMode('list')
        const defaultAddress = res.addresses.find(a => a.is_default) || res.addresses[0]
        setSelectedAddressId(defaultAddress.id)
      } else {
        setAddressFormMode('add')
      }
      setIsLoadingAddresses(false)
    }
    loadAddresses()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveAddress = async () => {
    if (!address.name || !address.address || !address.city || !address.state || !address.pincode) {
      toast.error('Please complete all address fields')
      return
    }

    const payload: AddressInput = {
      name: address.name,
      mobile_number: address.mobile_number,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      label: address.label || 'Home',
      is_default: savedAddresses.length === 0 ? true : address.is_default
    }

    if (addressFormMode === 'add') {
      const res = await addUserAddress(payload)
      if (res.success && res.address) {
        setSavedAddresses(prev => [res.address!, ...prev])
        setSelectedAddressId(res.address.id)
        setAddressFormMode('list')
        toast.success('Address added successfully')
      } else {
        toast.error(res.error || 'Failed to add address')
      }
    } else if (addressFormMode === 'edit' && selectedAddressId) {
      const res = await updateUserAddress(selectedAddressId, payload)
      if (res.success && res.address) {
        setSavedAddresses(prev => prev.map(a => a.id === selectedAddressId ? res.address! : a))
        setAddressFormMode('list')
        toast.success('Address updated successfully')
      } else {
        toast.error(res.error || 'Failed to update address')
      }
    }
  }

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const res = await deleteUserAddress(id)
    if (res.success) {
      const remaining = savedAddresses.filter(a => a.id !== id)
      setSavedAddresses(remaining)
      if (selectedAddressId === id) {
        setSelectedAddressId(remaining.length > 0 ? remaining[0].id : null)
      }
      if (remaining.length === 0) {
        setAddressFormMode('add')
      }
      toast.success('Address deleted')
    } else {
      toast.error('Failed to delete address')
    }
  }

  const handleEditAddress = (addr: Address, e: React.MouseEvent) => {
    e.stopPropagation()
    setAddress({
      name: addr.name,
      mobile_number: addr.mobile_number,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      label: addr.label,
      is_default: addr.is_default
    })
    setSelectedAddressId(addr.id)
    setAddressFormMode('edit')
  }

  // Derived Calculations
  const pricingInput: Record<string, { storeName: string, items: any[] }> = {}
  Object.keys(itemsByStore).forEach(storeId => {
    pricingInput[storeId] = {
      storeName: itemsByStore[storeId].storeName,
      items: itemsByStore[storeId].items.map((i: any) => ({
        ...i,
        quantity: i.quantity,
        price: i.price,
        gst_rate: i.product?.gst_rate ?? i.gst_rate // Try getting gst_rate from nested product if available
      }))
    }
  })

  // We need to import calculateGlobalTotals. It's a client component, so we can require it.
  const { calculateGlobalTotals } = require('@/lib/pricing')
  
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const totals = calculateGlobalTotals(pricingInput, discountAmount)
  
  const subtotal = totals.globalSubtotal
  const gstTotal = totals.globalGst
  const shippingCharge = totals.globalShipping
  const finalTotal = totals.globalTotal

  // Estimate Delivery Date (3-5 days from now)
  const deliveryDateOptions = useMemo(() => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(today.getDate() + 3)
    const maxDate = new Date(today)
    maxDate.setDate(today.getDate() + 5)
    
    return `${minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsValidatingCoupon(true)
    try {
      const res = await validateCouponAction(couponCode.trim(), subtotal)
      if (res.success && res.discountAmount) {
        setAppliedCoupon({ code: res.code!, discountAmount: res.discountAmount })
        toast.success(`Coupon ${res.code} applied!`)
      } else {
        toast.error(res.error || 'Invalid coupon')
        setAppliedCoupon(null)
      }
    } catch (e) {
      toast.error('Error validating coupon')
    }
    setIsValidatingCoupon(false)
  }

  const handlePlaceOrder = async () => {
    let finalAddressData = null
    if (addressFormMode === 'list' && selectedAddressId) {
      finalAddressData = savedAddresses.find(a => a.id === selectedAddressId)
    } else {
      finalAddressData = address
    }

    if (!finalAddressData || !finalAddressData.name || !finalAddressData.address || !finalAddressData.city || !finalAddressData.state || !finalAddressData.pincode) {
      toast.error('Please select or complete your delivery address')
      if (addressFormMode !== 'list') setAddressFormMode('add')
      return
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    setIsPlacing(true)
    try {
      const addressPayload = {
        name: finalAddressData.name,
        mobile_number: finalAddressData.mobile_number,
        address: finalAddressData.address,
        city: finalAddressData.city,
        state: finalAddressData.state,
        pincode: finalAddressData.pincode
      }
      const res = await placeOrder(addressPayload, appliedCoupon?.code || null, paymentMethod)
      if (!res.success) {
        toast.error(res.error || 'Failed to place order')
        setIsPlacing(false)
        return
      }
      await refreshCart()
      
      if (res.clientSecret) {
        // Render Stripe checkout
        setStripeClientSecret(res.clientSecret)
        setStripeOrderGroupId(res.orderGroupId!)
      } else {
        toast.success('Order placed successfully!')
        router.push(`/checkout/success/${res.orderGroupId}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred')
      setIsPlacing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-col-reverse lg:flex-row">
      {/* Left Column: Delivery Address, Items, Payment */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Delivery Address Section */}
        <div className="bg-surface-base p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <h2 className="text-xl font-bold font-heading flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-primary" /> Delivery Address
            </h2>
            {addressFormMode === 'list' && (
              <button 
                onClick={() => {
                  setAddress({
                    name: profile?.name || '', mobile_number: profile?.mobile_number || '', address: '', city: '', state: '', pincode: '', label: 'Home', is_default: savedAddresses.length === 0
                  })
                  setAddressFormMode('add')
                }}
                className="text-sm font-semibold flex items-center gap-1 text-accent-primary hover:text-accent-soft transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New
              </button>
            )}
          </div>

          {isLoadingAddresses ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
            </div>
          ) : addressFormMode === 'list' ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id
                return (
                  <label 
                    key={addr.id} 
                    className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary' : 'border-border/50 hover:bg-muted/30'}`}
                  >
                    <input 
                      type="radio" 
                      name="selectedAddress" 
                      checked={isSelected}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1.5 w-4 h-4 text-accent-primary border-muted-foreground focus:ring-accent-primary" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground">{addr.name}</h4>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground rounded-md">{addr.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => handleEditAddress(addr, e)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => handleDeleteAddress(addr.id, e)} className="text-muted-foreground hover:text-status-error transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        {addr.address}<br />
                        {addr.city}, {addr.state} {addr.pincode}<br />
                        <span className="font-medium mt-1 inline-block">{addr.mobile_number}</span>
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={address.name} onChange={handleInputChange} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input id="mobile_number" name="mobile_number" value={address.mobile_number} onChange={handleInputChange} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" name="address" value={address.address} onChange={handleInputChange} placeholder="123 Main St, Apartment 4B" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={address.city} onChange={handleInputChange} placeholder="Mumbai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={address.state} onChange={handleInputChange} placeholder="Maharashtra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" value={address.pincode} onChange={handleInputChange} placeholder="400001" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Address Label</Label>
                  <Input id="label" name="label" value={address.label} onChange={handleInputChange} placeholder="Home, Work, etc." />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="is_default"
                      checked={address.is_default}
                      onChange={(e) => setAddress(prev => ({...prev, is_default: e.target.checked}))}
                      className="w-4 h-4 rounded border-border text-accent-primary focus:ring-accent-primary" 
                    />
                    <span className="text-sm font-medium">Set as default address</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                {savedAddresses.length > 0 && (
                  <button 
                    onClick={() => setAddressFormMode('list')}
                    className="px-6 py-2 border border-border text-foreground font-bold rounded-lg hover:bg-muted/50 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={handleSaveAddress}
                  disabled={!address.name || !address.address || !address.city || !address.state || !address.pincode}
                  className="px-6 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Save Address
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="bg-surface-base p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
            <Wallet className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-bold font-heading">Payment Method</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'UPI', label: 'UPI', icon: Wallet },
              { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
              { id: 'NetBanking', label: 'Net Banking', icon: Landmark },
              { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
            ].map(method => {
              const Icon = method.icon
              const isSelected = paymentMethod === method.id
              return (
                <label 
                  key={method.id} 
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${isSelected ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary' : 'border-border/50 hover:bg-muted/30'}`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method.id} 
                    checked={isSelected}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-accent-primary' : 'border-muted-foreground'}`}>
                    {isSelected && <div className="size-2.5 rounded-full bg-accent-primary animate-in zoom-in" />}
                  </div>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-accent-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{method.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Order Items Grouped by Seller */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-heading px-2">Order Items</h2>
          {Object.values(itemsByStore).map((storeGroup: any, idx) => (
            <div key={idx} className="bg-surface-base p-6 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="font-semibold text-lg text-foreground mb-4 pb-4 border-b border-border/50">
                From {storeGroup.storeName}
              </h3>
              
              <div className="space-y-4">
                {storeGroup.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative size-20 rounded-xl overflow-hidden bg-muted/20 shrink-0 border">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-medium line-clamp-1">{item.title}</h4>
                      <div className="text-sm text-muted-foreground flex gap-3 mt-0.5">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Checkout Summary & Action */}
      <div className="lg:col-span-5">
        <div className="bg-surface-base p-6 md:p-8 rounded-2xl border border-border/50 shadow-lg sticky top-24">
          <h2 className="text-2xl font-bold font-heading mb-6">Order Summary</h2>
          
          {/* Coupon Code Section */}
          <div className="mb-6 pb-6 border-b border-border/50">
            <Label htmlFor="coupon" className="text-sm font-semibold mb-2 block flex items-center gap-2">
              <Tag className="w-4 h-4" /> Have a coupon?
            </Label>
            <div className="flex gap-2">
              <Input 
                id="coupon" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                placeholder="Enter code (e.g., NOVA10)" 
                className="uppercase"
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <button 
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                  className="px-4 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 disabled:opacity-50 shrink-0"
                >
                  {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              ) : (
                <button 
                  onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                  className="px-4 py-2 bg-status-error/10 text-status-error font-bold rounded-lg hover:bg-status-error/20 shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            {appliedCoupon && (
              <div className="mt-2 text-sm text-status-success flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Coupon {appliedCoupon.code} applied!
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-4 text-sm mb-6 pb-6 border-b border-border/50">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Shipping</span>
              {shippingCharge === 0 ? (
                <span className="text-status-success font-semibold">Free</span>
              ) : (
                <span>₹{shippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowGstDetails(!showGstDetails)}
                className="flex justify-between items-center text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <span className="flex items-center gap-1">
                  Estimated GST 
                  {showGstDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <span>₹{gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </button>
              
              <AnimatePresence>
                {showGstDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 border-l-2 border-border/50 py-2 space-y-2 mt-1">
                      {Object.values(pricingInput).map((store: any, sIdx) => 
                        store.items.map((item: any, iIdx: number) => {
                          const itemTotal = item.price * item.quantity;
                          const actualRate = typeof item.gst_rate === 'number' ? item.gst_rate : 18;
                          const itemGst = (itemTotal * actualRate) / 100;
                          return (
                            <div key={`${sIdx}-${iIdx}`} className="flex justify-between text-xs text-muted-foreground">
                              <span className="truncate max-w-[200px]" title={item.title}>
                                {item.title} ({actualRate}%)
                              </span>
                              <span>₹{itemGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-status-success font-medium">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-end mb-6">
            <span className="text-lg font-bold text-foreground">Total Payable</span>
            <span className="text-3xl font-black font-heading text-foreground">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 mb-8">
            <div className="p-2 bg-background rounded-full shadow-sm">
              <CalendarDays className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Estimated Delivery</div>
              <div className="font-bold text-foreground">{deliveryDateOptions}</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || finalTotal <= 0 || addressFormMode !== 'list' || !paymentMethod}
              className="w-full h-14 bg-foreground text-background hover:bg-accent-primary hover:text-background transition-all rounded-xl font-bold text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
            >
              {isPlacing ? (
                <span className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  Place Order
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {stripeClientSecret && stripeOrderGroupId && (
        <StripePaymentModal 
          clientSecret={stripeClientSecret}
          orderGroupId={stripeOrderGroupId}
          amount={finalTotal}
          onCancel={() => {
            setStripeClientSecret(null)
            setStripeOrderGroupId(null)
            toast.info('Payment cancelled. Your order has been placed but awaits payment.')
            router.push(`/account/orders`)
          }}
        />
      )}
    </div>
  )
}
