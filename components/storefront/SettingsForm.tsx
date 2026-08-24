'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Bell, Lock, Palette, Globe, Loader2, Save, CheckCircle2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateSettings } from '@/app/actions/settings'
import { useTheme } from 'next-themes'

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
]

export function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('account')

  const [settings, setSettings] = useState({
    // Account
    two_factor_auth: initialSettings?.two_factor_auth ?? false,
    
    // Notifications
    email_notifications: initialSettings?.email_notifications ?? true,
    order_updates: initialSettings?.order_updates ?? true,
    promotions: initialSettings?.promotions ?? false,
    
    // Privacy & Security
    profile_visibility: initialSettings?.profile_visibility ?? 'private',
    data_sharing: initialSettings?.data_sharing ?? false,
    
    // Appearance
    theme_preference: initialSettings?.theme_preference ?? 'system',
    
    // Language
    language: 'en',
    region: initialSettings?.region ?? 'IN',
  })

  // Sync highlighting with actual applied theme
  useEffect(() => {
    if (theme && theme !== settings.theme_preference) {
      setSettings(prev => ({ ...prev, theme_preference: theme }))
    }
  }, [theme])

  const [searchQuery, setSearchQuery] = useState(
    COUNTRIES.find(c => c.code === settings.region)?.name || ''
  )
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false)

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    if (key === 'theme_preference') {
      setTheme(value)
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSettings(settings)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Settings saved successfully')
      }
    })
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <TabsList className="flex md:flex-col !h-auto min-h-fit bg-transparent p-0 gap-2 overflow-x-auto md:overflow-visible w-full justify-start items-start">
            <TabsTrigger 
              value="account" 
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <User className="w-4 h-4" /> Account
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <Lock className="w-4 h-4" /> Privacy & Security
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-fuchsia-600 dark:data-[state=active]:text-fuchsia-400 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <Palette className="w-4 h-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="language" 
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <Globe className="w-4 h-4" /> Language
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <TabsContent value="account" className="mt-0 outline-none">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                <CardTitle className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-6 h-6 text-indigo-500" /> Account Settings
                </CardTitle>
                <CardDescription className="text-base mt-2">Manage your account security and credentials.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                  </div>
                  <Switch 
                    checked={settings.two_factor_auth} 
                    onCheckedChange={(v) => handleChange('two_factor_auth', v)} 
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 outline-none">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                <CardTitle className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-6 h-6 text-pink-500" /> Notifications
                </CardTitle>
                <CardDescription className="text-base mt-2">Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-slate-900 dark:text-white">Email Updates</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive NOVA promotions, new arrivals, offers and important updates on your registered email.</p>
                  </div>
                  <Switch 
                    checked={settings.email_notifications} 
                    onCheckedChange={(v) => handleChange('email_notifications', v)} 
                    className="data-[state=checked]:bg-pink-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-slate-900 dark:text-white">Order Updates</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get tracking info and delivery updates.</p>
                  </div>
                  <Switch 
                    checked={settings.order_updates} 
                    onCheckedChange={(v) => handleChange('order_updates', v)} 
                    className="data-[state=checked]:bg-pink-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-slate-900 dark:text-white">Promotions & Offers</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive exclusive discounts and new arrivals.</p>
                  </div>
                  <Switch 
                    checked={settings.promotions} 
                    onCheckedChange={(v) => handleChange('promotions', v)} 
                    className="data-[state=checked]:bg-pink-600"
                  />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-0 outline-none">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                <CardTitle className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-6 h-6 text-purple-500" /> Security
                </CardTitle>
                <CardDescription className="text-base mt-2">Manage your password and account security.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold text-slate-900 dark:text-white">Change Password</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update your account password securely.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm h-9 px-4 py-2 rounded-xl">
                      Update <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Change Password</DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                          Enter your current password and a new secure password.
                        </DialogDescription>
                      </DialogHeader>
                      <form action={async (formData) => {
                        startTransition(async () => {
                          const { updatePassword } = await import('@/app/actions/auth')
                          const result = await updatePassword(formData)
                          if (result.error) {
                            toast.error(result.error)
                          } else {
                            toast.success('Password updated successfully! You can now log in with your new password.')
                            const form = document.getElementById('password-form') as HTMLFormElement
                            if (form) form.reset()
                          }
                        })
                      }} id="password-form" className="space-y-5 pt-4">
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <a href="/forgot-password" target="_blank" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors font-medium">
                              Forgot password?
                            </a>
                          </div>
                          <Input 
                            id="currentPassword" 
                            name="currentPassword" 
                            type="password" 
                            required 
                            className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            name="newPassword" 
                            type="password" 
                            required 
                            minLength={6}
                            className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            type="password" 
                            required 
                            minLength={6}
                            className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl"
                          />
                        </div>

                        <Button type="submit" disabled={isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11 rounded-xl mt-4">
                          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                          Update Password
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 outline-none">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                <CardTitle className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-6 h-6 text-fuchsia-500" /> Appearance
                </CardTitle>
                <CardDescription className="text-base mt-2">Customize how NOVA looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-slate-900 dark:text-white">Theme Preference</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['light', 'dark'].map((t) => (
                      <div 
                        key={t}
                        onClick={() => handleChange('theme_preference', t)}
                        className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                          settings.theme_preference === t 
                            ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/10' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full mb-3 ${
                          t === 'light' ? 'bg-amber-400' : t === 'dark' ? 'bg-slate-800' : 'bg-gradient-to-tr from-amber-400 to-slate-800'
                        }`} />
                        <span className="font-medium capitalize text-slate-900 dark:text-white">{t} Theme</span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="mt-0 outline-none">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                <CardTitle className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-500" /> Language & Region
                </CardTitle>
                <CardDescription className="text-base mt-2">Choose your preferred language and region settings.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-900 dark:text-white">Display Language</Label>
                  <Select value="en" disabled>
                    <SelectTrigger className="w-full md:w-[300px] h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 opacity-70">
                      <SelectValue placeholder="English (US)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Currently, only English is supported.</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Label className="text-base font-semibold text-slate-900 dark:text-white">Region</Label>
                  <div className="relative w-full md:w-[300px]">
                    <Input 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setIsRegionDropdownOpen(true)
                      }}
                      onFocus={() => setIsRegionDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsRegionDropdownOpen(false), 200)}
                      placeholder="Search country..."
                      className="h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 w-full pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Globe className="w-4 h-4 text-slate-400" />
                    </div>
                    
                    {isRegionDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map(country => (
                            <div
                              key={country.code}
                              onClick={() => {
                                handleChange('region', country.code)
                                setSearchQuery(country.name)
                                setIsRegionDropdownOpen(false)
                              }}
                              className={`px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between ${settings.region === country.code ? 'bg-slate-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                            >
                              {country.name}
                              {settings.region === country.code && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-slate-500 text-sm">No countries found.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Bar */}
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 h-12 px-8 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

        </div>
      </Tabs>
    </div>
  )
}
