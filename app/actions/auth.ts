'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { mergeGuestCart } from './cart'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
  currentPath: z.string().optional().default('/'),
  redirectTo: z.string().optional()
})

const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  role: z.enum(['customer', 'seller']).optional().default('customer'),
  currentPath: z.string().optional().default('/'),
  redirectTo: z.string().optional()
})

const PasswordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export async function login(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email')?.toString().trim(),
    password: formData.get('password')?.toString(),
    rememberMe: formData.get('rememberMe') === 'on',
    currentPath: formData.get('currentPath')?.toString(),
    redirectTo: formData.get('redirectTo')?.toString()
  })
  
  if (!parsed.success) {
    const errorMsg = parsed.error.message || 'Invalid input'
    const currentPath = formData.get('currentPath')?.toString() || '/'
    const separator = currentPath.includes('?') ? '&' : '?'
    return redirect(`${currentPath}${separator}error=${encodeURIComponent(errorMsg)}`)
  }

  const { email, password, rememberMe, currentPath, redirectTo } = parsed.data

  const cookieStore = await cookies()
  cookieStore.set('nova-remember-me', rememberMe ? 'true' : 'false', { path: '/' })

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const separator = currentPath.includes('?') ? '&' : '?'
    // Generic error message for security
    const safeMsg = error.message.includes('credential') ? 'Invalid login credentials' : 'An error occurred during login'
    return redirect(`${currentPath}${separator}error=${encodeURIComponent(safeMsg)}`)
  }

  if (data?.user) {
    try {
      await mergeGuestCart(data.user.id)
    } catch (e) {
      console.error("Failed to merge cart:", e)
    }
    
    // Failsafe: if profile is somehow missing, try to create it silently
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single()
    if (!profile) {
      const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      await adminClient.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'customer',
        name: data.user.user_metadata?.name || ''
      })
    }

    if (currentPath === '/admin/login' || redirectTo?.startsWith('/admin')) {
      const { data: profileCheck } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      if (profileCheck?.role === 'platform_admin') {
        return redirect('/admin')
      } else {
        await supabase.auth.signOut()
        return redirect(`/admin/login?error=${encodeURIComponent('Access denied. You do not have permission to access the Admin Panel.')}`)
      }
    }

    // If the user logs in from the seller login page, verify seller status via stores table
    if (currentPath === '/seller/login' || redirectTo?.startsWith('/seller')) {
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', data.user.id).single()
      if (store) {
        return redirect('/seller')
      } else {
        return redirect('/seller/create-store')
      }
    }

    const { data: finalProfile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (finalProfile?.role === 'platform_admin') return redirect('/admin')
  }

  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo)
  }
  redirect('/')
}

export async function signup(formData: FormData) {
  const parsed = SignupSchema.safeParse({
    email: formData.get('email')?.toString().trim(),
    password: formData.get('password')?.toString(),
    name: formData.get('name')?.toString(),
    role: formData.get('role')?.toString(),
    currentPath: formData.get('currentPath')?.toString(),
    redirectTo: formData.get('redirectTo')?.toString()
  })

  if (!parsed.success) {
    const errorMsg = parsed.error.message || 'Invalid input'
    const currentPath = formData.get('currentPath')?.toString() || '/'
    const separator = currentPath.includes('?') ? '&' : '?'
    return redirect(`${currentPath}${separator}error=${encodeURIComponent(errorMsg)}`)
  }

  const { email, password, name, role, currentPath, redirectTo } = parsed.data
  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Create the user safely and auto-confirm them
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, name }
  })

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already registered')) {
      const separator = currentPath.includes('?') ? '&' : '?'
      if (role === 'seller') {
        return redirect(`/seller/login${separator}error=${encodeURIComponent('You already have a NOVA account. Please log in with your customer credentials to open a store.')}`)
      }
      return redirect(`/login${separator}error=${encodeURIComponent('You already have an account. Please log in.')}`)
    }
    const separator = currentPath.includes('?') ? '&' : '?'
    return redirect(`${currentPath}${separator}error=${encodeURIComponent('Registration failed. Please try again.')}`)
  }

  if (data?.user) {
    // 2. Failsafe profile creation
    const { data: existingProfile } = await adminClient.from('profiles').select('id').eq('id', data.user.id).single()
    if (!existingProfile) {
      await adminClient.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: role,
        name: name
      })
    }

    // Automatically create the store for sellers during signup
    if (role === 'seller') {
      const baseSlug = (name || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`
      
      const { data: existingStore } = await adminClient.from('stores').select('id').eq('owner_id', data.user.id).single()
      if (!existingStore) {
        await adminClient.from('stores').insert({
          owner_id: data.user.id,
          name: name || 'My Store',
          slug: uniqueSlug,
          description: 'A premium store on NOVA.',
          status: 'pending'
        })
      }
    }

    // 3. Log the user in so their session is immediately ready
    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password })
    
    try {
      await mergeGuestCart(data.user.id)
    } catch (e) {
      console.error("Failed to merge cart:", e)
    }
  }

  if (role === 'seller') return redirect('/seller')
  if (redirectTo && redirectTo.startsWith('/')) redirect(redirectTo)
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const { headers } = await import('next/headers')
  const headerList = await headers()
  const referer = headerList.get('referer') || ''
  
  if (referer.includes('/seller')) {
    redirect('/seller/login')
  } else if (referer.includes('/admin')) {
    redirect('/admin/login')
  }
  
  redirect('/')
}

export async function updatePassword(formData: FormData) {
  const parsed = PasswordUpdateSchema.safeParse({
    currentPassword: formData.get('currentPassword')?.toString(),
    newPassword: formData.get('newPassword')?.toString(),
    confirmPassword: formData.get('confirmPassword')?.toString()
  })

  if (!parsed.success) {
    return { error: parsed.error.message || 'Invalid input', success: false }
  }

  const { currentPassword, newPassword } = parsed.data
  const supabase = await createClient()
  
  // Verify current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user || !user.email) {
    return { error: 'Unauthorized. Please log in again.', success: false }
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })
  if (signInError) {
    return { error: 'Incorrect current password', success: false }
  }

  // Update password securely
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (updateError) {
    return { error: 'Failed to update password', success: false }
  }

  return { error: null, success: true }
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email')?.toString()
  const emailSchema = z.string().email()
  
  if (!email || !emailSchema.safeParse(email).success) {
    return { error: 'Valid email is required', success: false }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })

  if (error) {
    return { error: 'Failed to request password reset', success: false }
  }

  return { error: null, success: true }
}

export async function resetPassword(formData: FormData) {
  const newPassword = formData.get('newPassword')?.toString() || ''
  const confirmPassword = formData.get('confirmPassword')?.toString() || ''

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match', success: false }
  }
  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters', success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: 'Failed to reset password', success: false }
  }

  return { error: null, success: true }
}
