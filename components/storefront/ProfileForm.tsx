'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Phone, Calendar, MapPin, Loader2, Camera, CheckCircle2, Save, Edit2, X, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateProfile } from '@/app/actions/profile'
import { addUserAddress, updateUserAddress, AddressInput } from '@/app/actions/addresses'
import { calculateAge, getInitials } from '@/lib/utils'
import { motion, useReducedMotion, AnimatePresence, useSpring, useTransform, Variants, MotionValue } from 'framer-motion'

const AmberCoral = () => (
  <svg viewBox="0 0 200 400" className="absolute -left-20 bottom-10 w-48 h-96 pointer-events-none drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] z-[-1]" style={{ transform: 'rotate(-15deg)' }}>
    <path
      fill="url(#amber-grad)"
      d="M180,380 C150,350 160,300 120,290 C80,280 40,300 30,260 C20,220 70,230 60,190 C50,150 10,130 30,90 C50,50 100,70 120,40 C130,20 160,10 180,30 C200,50 180,80 180,100 C180,130 200,160 170,180 C140,200 160,240 180,260 C200,280 190,320 200,340 C210,360 190,390 180,380 Z"
    />
    <path
      fill="url(#amber-grad)"
      d="M160,320 C100,300 120,250 80,240 C40,230 20,260 10,210 C0,160 40,170 30,130 C20,90 60,70 80,40 C100,70 120,100 100,140 C80,180 140,180 120,220 C100,260 180,270 160,320 Z"
    />
    <circle cx="20" cy="120" r="15" fill="url(#amber-grad)" className="opacity-80" />
    <circle cx="40" cy="50" r="8" fill="url(#amber-grad)" className="opacity-60" />
    <circle cx="10" cy="200" r="10" fill="url(#amber-grad)" className="opacity-70" />
    <defs>
      <linearGradient id="amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
  </svg>
)

const PurpleCoral = () => (
  <svg viewBox="0 0 200 400" className="absolute -right-20 bottom-10 w-48 h-96 pointer-events-none drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] z-[-1]" style={{ transform: 'rotate(15deg)' }}>
    <path
      fill="url(#purple-grad)"
      d="M20,380 C50,350 40,300 80,290 C120,280 160,300 170,260 C180,220 130,230 140,190 C150,150 190,130 170,90 C150,50 100,70 80,40 C70,20 40,10 20,30 C0,50 20,80 20,100 C20,130 0,160 30,180 C60,200 40,240 20,260 C0,280 10,320 0,340 C-10,360 10,390 20,380 Z"
    />
    <path
      fill="url(#purple-grad)"
      d="M40,320 C100,300 80,250 120,240 C160,230 180,260 190,210 C200,160 160,170 170,130 C180,90 140,70 120,40 C100,70 80,100 100,140 C120,180 60,180 80,220 C100,260 20,270 40,320 Z"
    />
    <circle cx="180" cy="120" r="15" fill="url(#purple-grad)" className="opacity-80" />
    <circle cx="160" cy="50" r="8" fill="url(#purple-grad)" className="opacity-60" />
    <circle cx="190" cy="200" r="10" fill="url(#purple-grad)" className="opacity-70" />
    <defs>
      <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#7e22ce" />
      </linearGradient>
    </defs>
  </svg>
)

export function ProfileForm({ initialData, initialAddress }: { initialData: any, initialAddress?: any }) {
  const prefersReducedMotion = useReducedMotion()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  
  // Address State
  const [isEditingAddress, setIsEditingAddress] = useState(!initialAddress)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [isAddressSuccess, setIsAddressSuccess] = useState(false)
  const [addressData, setAddressData] = useState({
    id: initialAddress?.id || null,
    name: initialAddress?.name || initialData.name || '',
    mobile_number: initialAddress?.mobile_number || initialData.mobile_number || '',
    address: initialAddress?.address || initialData.address || '',
    city: initialAddress?.city || initialData.city || '',
    state: initialAddress?.state || initialData.state || '',
    pincode: initialAddress?.pincode || initialData.pincode || '',
  })

  const [age, setAge] = useState<number | ''>(
    initialData.date_of_birth ? calculateAge(new Date(initialData.date_of_birth)) : ''
  )
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData.profile_photo_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const animatedAge = useSpring(0, { stiffness: 60, damping: 20 })
  useEffect(() => {
    if (age !== '') animatedAge.set(age as number)
    else animatedAge.set(0)
  }, [age, animatedAge])
  
  const [displayAge, setDisplayAge] = useState<number | ''>(age)
  useEffect(() => {
    return animatedAge.on("change", (latest) => {
      setDisplayAge(Math.round(latest))
    })
  }, [animatedAge])

  const x1 = useSpring(0.5, { stiffness: 300, damping: 30 })
  const y1 = useSpring(0.5, { stiffness: 300, damping: 30 })
  const rotateX1 = useTransform(y1, [0, 1], [6, -6])
  const rotateY1 = useTransform(x1, [0, 1], [-6, 6])

  const x2 = useSpring(0.5, { stiffness: 300, damping: 30 })
  const y2 = useSpring(0.5, { stiffness: 300, damping: 30 })
  const rotateX2 = useTransform(y2, [0, 1], [6, -6])
  const rotateY2 = useTransform(x2, [0, 1], [-6, 6])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, x: MotionValue, y: MotionValue) => {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const xPos = (e.clientX - rect.left) / rect.width
    const yPos = (e.clientY - rect.top) / rect.height
    x.set(xPos)
    y.set(yPos)
  }

  const handleMouseLeave = (x: MotionValue, y: MotionValue) => {
    x.set(0.5)
    y.set(0.5)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setAge(calculateAge(new Date(e.target.value)))
    } else {
      setAge('')
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setIsSuccess(false)
    setIsError(false)
    
    if (initialData.profile_photo_url && !formData.get('photo')) {
      formData.append('existing_photo_url', initialData.profile_photo_url)
    }

    try {
      const result = await updateProfile(formData)
      if (result?.error) {
        setIsError(true)
        toast.error(result.error)
        setTimeout(() => setIsError(false), 3000)
      } else {
        setIsSuccess(true)
        toast.success('Profile updated successfully!')
        setTimeout(() => {
          setIsSuccess(false)
          setIsEditingProfile(false)
        }, 2000)
      }
    } catch (error) {
      setIsError(true)
      toast.error('An unexpected error occurred')
      setTimeout(() => setIsError(false), 3000)
    } finally {
      setIsPending(false)
    }
  }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingAddress(true)
    setIsAddressSuccess(false)
    
    try {
      const payload: AddressInput = {
        name: addressData.name,
        mobile_number: addressData.mobile_number,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        label: 'Home',
        is_default: true
      }

      if (addressData.id) {
        const result = await updateUserAddress(addressData.id, payload)
        if (result.success) {
          setIsAddressSuccess(true)
          toast.success('Address updated successfully!')
          setTimeout(() => {
            setIsAddressSuccess(false)
            setIsEditingAddress(false)
          }, 2000)
        } else {
          toast.error(result.error || 'Failed to update address')
        }
      } else {
        const result = await addUserAddress(payload)
        if (result.success) {
          setAddressData(prev => ({...prev, id: result.address?.id}))
          setIsAddressSuccess(true)
          toast.success('Address saved successfully!')
          setTimeout(() => {
            setIsAddressSuccess(false)
            setIsEditingAddress(false)
          }, 2000)
        } else {
          toast.error(result.error || 'Failed to add address')
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSavingAddress(false)
    }
  }

  const initials = getInitials(initialData.name, initialData.email)
  const today = new Date().toISOString().split('T')[0]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.15 }
    }
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 50, rotateX: prefersReducedMotion ? 0 : 15, transformPerspective: 1000 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 200, damping: 25 } }
  }

  const fieldVariants: Variants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  }

  return (
    <motion.div 
      className="space-y-12 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ perspective: "1000px" }}
    >
      {/* Hero / Avatar Section */}
      <motion.div variants={cardVariants} className="flex flex-col items-center justify-center space-y-6 mb-16 relative z-20">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          
          {/* Split Gradient Halo */}
          {!prefersReducedMotion && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute -inset-3 rounded-xl opacity-80 blur-xl group-hover:opacity-100 transition-opacity duration-500"
              style={{ backgroundImage: `conic-gradient(from 180deg, transparent 0deg, #f59e0b 90deg, transparent 180deg, #a855f7 270deg, transparent 360deg)` }}
            />
          )}

          {/* Main Avatar Container */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-32 h-32 rounded-xl overflow-hidden border-[3px] border-white/80 dark:border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10 flex items-center justify-center transition-all duration-300 backdrop-blur-md bg-white/40 dark:bg-black/40"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <span className="text-4xl font-bold text-slate-800 dark:text-white tracking-tighter drop-shadow-md">{initials}</span>
            )}
            
            {/* Smooth Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
              <Camera className="w-8 h-8 text-white mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300" />
            </div>
          </motion.div>

          <input 
            type="file" 
            name="photo" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 drop-shadow-md">
            Hi, {initialData.name || 'User'} <span className="text-2xl animate-wave">👋</span>
          </h2>
          <p className="text-slate-600 dark:text-white/60 font-medium">Manage your profile information</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 pb-20">
        
        {/* Personal Info Card wrapper */}
        <motion.div 
          variants={cardVariants} 
          className="relative h-full z-10 group/card"
          style={{ rotateX: prefersReducedMotion ? 0 : rotateX1, rotateY: prefersReducedMotion ? 0 : rotateY1 }}
          onMouseMove={(e) => handleMouseMove(e, x1, y1)}
          onMouseLeave={() => handleMouseLeave(x1, y1)}
        >
          <form action={handleSubmit} key={`profile-${JSON.stringify(initialData)}`} className="h-full">
            {/* SVG Coral Layer */}
            

          {/* Inner Content Panel */}
          <Card className="border-[1.5px] border-amber-500/20 dark:border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] bg-white/95 dark:bg-black/30 backdrop-blur-3xl h-full relative z-10 overflow-hidden text-slate-900 dark:text-white rounded-2xl"
            
          >
            <CardHeader className="pt-12 px-10 relative z-10">
              <CardTitle className="flex justify-between items-center w-full text-2xl drop-shadow-sm font-bold text-amber-500 pr-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                    <User className="w-7 h-7" />
                  </div>
                  Personal Information
                </div>
                {!isEditingProfile && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={(e) => { e.preventDefault(); setIsEditingProfile(true); }}
                    className="text-amber-500 hover:text-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-500/20 mr-12 md:mr-16 z-20"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-white/60 mt-2 font-medium pl-14">Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-10 lg:px-14 pb-16 relative z-10">
              
              <motion.div variants={fieldVariants} className="space-y-2 group/field">
                <Label htmlFor="name" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 group-focus-within/field:text-amber-500 transition-colors z-10">
                    <User className="w-5 h-5" />
                  </div>
                  <Input id="name" name="name" defaultValue={initialData.name || ''} readOnly={!isEditingProfile} required placeholder="Abdul Waheed" className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-amber-500/50 focus-visible:border-amber-500 transition-all font-bold ${!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}`} />
                </div>
              </motion.div>

              <motion.div variants={fieldVariants} className="space-y-2 group/field">
                <Label htmlFor="email" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Email Address</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 group-focus-within/field:text-amber-500 transition-colors z-10">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input id="email" name="email" type="email" defaultValue={initialData.email || ''} readOnly={!isEditingProfile} required className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-amber-500/50 focus-visible:border-amber-500 transition-all font-bold ${!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}`} />
                </div>
              </motion.div>

              <motion.div variants={fieldVariants} className="space-y-2 group/field">
                <Label htmlFor="mobile_number" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Mobile Number</Label>
                <div className="flex gap-3">
                  <div className="relative w-28">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 group-focus-within/field:text-amber-500 transition-colors z-10">
                      <Phone className="w-5 h-5" />
                    </div>
                    <Input disabled value="+91" className="pl-12 rounded-xl h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/80 font-bold cursor-default opacity-80 shadow-sm dark:shadow-none" />
                  </div>
                  <Input id="mobile_number" name="mobile_number" type="tel" defaultValue={initialData.mobile_number || ''} readOnly={!isEditingProfile} placeholder="95555 00000" className={`flex-1 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-amber-500/50 focus-visible:border-amber-500 transition-all font-bold px-6 ${!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}`} />
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-5">
                <motion.div variants={fieldVariants} className="space-y-2 group/field">
                  <Label htmlFor="date_of_birth" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Date of Birth</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 group-focus-within/field:text-amber-500 transition-colors pointer-events-none z-10">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <Input 
                      id="date_of_birth" 
                      name="date_of_birth" 
                      type="date" 
                      max={today}
                      defaultValue={initialData.date_of_birth || ''} 
                      onChange={handleDateChange}
                      readOnly={!isEditingProfile}
                      className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-amber-500/50 focus-visible:border-amber-500 transition-all font-bold [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-70 dark:[&::-webkit-calendar-picker-indicator]:invert ${!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}`} 
                    />
                  </div>
                </motion.div>
                
                <motion.div variants={fieldVariants} className="space-y-2 group/field">
                  <Label htmlFor="age" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Age</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 pointer-events-none z-10">
                      <User className="w-5 h-5" />
                    </div>
                    <Input id="age" value={displayAge} readOnly className="pl-12 rounded-xl h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/80 cursor-not-allowed font-bold font-mono text-lg shadow-sm dark:shadow-none" />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fieldVariants} className="space-y-2 group/field w-1/2">
                <Label htmlFor="gender" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Gender</Label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70 group-focus-within/field:text-amber-500 transition-colors pointer-events-none z-20">
                    <User className="w-5 h-5" />
                  </div>
                  <Select name="gender" defaultValue={initialData.gender || undefined} disabled={!isEditingProfile}>
                    <SelectTrigger className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-sm dark:shadow-none focus:ring-amber-500/50 focus:border-amber-500 transition-all font-bold z-10 relative ${!isEditingProfile ? 'opacity-70 pointer-events-none' : ''}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 dark:border-white/10 bg-white/95 dark:bg-black/90 text-slate-900 dark:text-white backdrop-blur-xl">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </CardContent>
            
            {/* Save Button Morphing Logic for Profile */}
            {isEditingProfile && (
              <div className="flex flex-col justify-center items-center gap-4 px-10 lg:px-14 pb-16 z-20 relative">
                <Button 
                  type="submit" 
                  disabled={isPending || isSuccess || isError}
                  className={`
                    font-sans font-semibold tracking-wide text-[15px]
                    rounded-xl transition-all duration-300 ease-out w-full max-w-[240px] h-12
                    ${isSuccess 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]' 
                      : isError
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_14px_0_rgba(239,68,68,0.39)]'
                      : 'bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-[2px]'
                    }
                  `}
                >
                  <AnimatePresence mode="wait">
                    {isPending ? (
                      <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </motion.div>
                    ) : isSuccess ? (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Profile Saved
                      </motion.div>
                    ) : isError ? (
                      <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Save Failed — Try Again
                      </motion.div>
                    ) : (
                      <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isPending}
                  className="font-sans font-medium text-[15px] rounded-xl px-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors w-full max-w-[240px] h-10 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            )}

            
          </Card>
          </form>
        </motion.div>

        {/* Address Info wrapper */}
        <motion.div 
          variants={cardVariants} 
          className="relative h-full z-10 group/card"
          style={{ rotateX: prefersReducedMotion ? 0 : rotateX2, rotateY: prefersReducedMotion ? 0 : rotateY2 }}
          onMouseMove={(e) => handleMouseMove(e, x2, y2)}
          onMouseLeave={() => handleMouseLeave(x2, y2)}
        >
          {/* SVG Coral Layer */}
          

          {/* Inner Content Panel */}
          <Card className="border-[1.5px] border-purple-500/20 dark:border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] bg-white/95 dark:bg-black/30 backdrop-blur-3xl h-full relative z-10 overflow-hidden text-slate-900 dark:text-white rounded-2xl"
            
          >
            <CardHeader className="pt-12 px-10 relative z-10">
              <CardTitle className="flex justify-between items-center w-full text-2xl drop-shadow-sm font-bold text-purple-600 dark:text-purple-400">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <MapPin className="w-7 h-7" />
                  </div>
                  Address Details
                </div>
                {!isEditingAddress && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditingAddress(true)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50 dark:text-purple-400 dark:hover:bg-purple-500/20 mr-12 md:mr-16 z-20"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-white/60 mt-2 font-medium pl-14">Your primary shipping and billing address</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddressSubmit} key={`address-${JSON.stringify(initialAddress || initialData)}`}>
              <CardContent className="space-y-6 px-10 lg:px-14 pb-8 relative z-10">
                
                <motion.div variants={fieldVariants} className="space-y-2 group/field">
                  <Label htmlFor="address" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">Street Address</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/70 group-focus-within/field:text-purple-500 transition-colors z-10">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <Input id="address" name="address" value={addressData.address} onChange={e => setAddressData(p => ({...p, address: e.target.value}))} readOnly={!isEditingAddress} placeholder="123 Main St, Apt 4B" className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-purple-500/50 focus-visible:border-purple-500 transition-all font-bold ${!isEditingAddress ? 'opacity-70 pointer-events-none' : ''}`} />
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-5">
                  <motion.div variants={fieldVariants} className="space-y-2 group/field">
                    <Label htmlFor="city" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">City</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/70 group-focus-within/field:text-purple-500 transition-colors z-10">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <Input id="city" name="city" value={addressData.city} onChange={e => setAddressData(p => ({...p, city: e.target.value}))} readOnly={!isEditingAddress} placeholder="New York" className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-purple-500/50 focus-visible:border-purple-500 transition-all font-bold ${!isEditingAddress ? 'opacity-70 pointer-events-none' : ''}`} />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={fieldVariants} className="space-y-2 group/field">
                    <Label htmlFor="state" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">State / Province</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/70 group-focus-within/field:text-purple-500 transition-colors z-10">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <Input id="state" name="state" value={addressData.state} onChange={e => setAddressData(p => ({...p, state: e.target.value}))} readOnly={!isEditingAddress} placeholder="NY" className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-purple-500/50 focus-visible:border-purple-500 transition-all font-bold ${!isEditingAddress ? 'opacity-70 pointer-events-none' : ''}`} />
                    </div>
                  </motion.div>
                </div>

                <motion.div variants={fieldVariants} className="space-y-2 group/field w-full">
                  <Label htmlFor="pincode" className="text-sm font-bold text-slate-900 dark:text-white/80 ml-2">ZIP / Postal Code</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/70 group-focus-within/field:text-purple-500 transition-colors z-10">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <Input id="pincode" name="pincode" value={addressData.pincode} onChange={e => setAddressData(p => ({...p, pincode: e.target.value}))} readOnly={!isEditingAddress} placeholder="10001" className={`pl-12 rounded-xl h-14 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 shadow-sm dark:shadow-none focus-visible:ring-purple-500/50 focus-visible:border-purple-500 transition-all font-bold ${!isEditingAddress ? 'opacity-70 pointer-events-none' : ''}`} />
                  </div>
                </motion.div>

              </CardContent>

              {isEditingAddress && (
                <div className="flex flex-col justify-center items-center gap-4 px-10 lg:px-14 pb-16 z-20 relative">
                  <Button 
                    type="submit" 
                    disabled={isSavingAddress || isAddressSuccess}
                    className={`
                      rounded-xl px-8 transition-all duration-500 w-full max-w-[200px]
                      ${isAddressSuccess 
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
                      }
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {isSavingAddress ? (
                        <motion.div key="loading" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        </motion.div>
                      ) : isAddressSuccess ? (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        </motion.div>
                      ) : (
                        <motion.div key="default" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                          <Save className="w-4 h-4 mr-2" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isSavingAddress ? 'Saving...' : isAddressSuccess ? 'Saved!' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => {
                      // Revert to initial
                      setAddressData({
                        id: initialAddress?.id || null,
                        name: initialAddress?.name || initialData.name || '',
                        mobile_number: initialAddress?.mobile_number || initialData.mobile_number || '',
                        address: initialAddress?.address || initialData.address || '',
                        city: initialAddress?.city || initialData.city || '',
                        state: initialAddress?.state || initialData.state || '',
                        pincode: initialAddress?.pincode || initialData.pincode || '',
                      })
                      setIsEditingAddress(false)
                    }}
                    disabled={isSavingAddress}
                    className="rounded-xl px-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 w-full max-w-[200px]"
                  >
                    Cancel
                  </Button>
                </div>
              )}

            </form>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  )
}
