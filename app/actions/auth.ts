'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const rawEmail = formData.get('email') as string
  const email = rawEmail?.trim()
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'on'
  const currentPath = formData.get('currentPath') as string || '/'
  const redirectTo = formData.get('redirectTo') as string
  
  const cookieStore = await cookies()
  cookieStore.set('nova-remember-me', rememberMe ? 'true' : 'false', { path: '/' })

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const separator = currentPath.includes('?') ? '&' : '?'
    return redirect(`${currentPath}${separator}error=${encodeURIComponent('Login failed: ' + error.message)}`)
  }

  if (data?.user) {
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
  const rawEmail = formData.get('email') as string
  const email = rawEmail?.trim()
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string || 'customer'
  const currentPath = formData.get('currentPath') as string || '/'
  const redirectTo = formData.get('redirectTo') as string

  const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Create the user safely and auto-confirm them to avoid "Invalid login credentials" issues
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
    return redirect(`${currentPath}${separator}error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user) {
    // 2. Failsafe: Ensure profile was created by the DB trigger. If trigger failed, create it manually.
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
    await supabase.auth.signInWithPassword({
      email,
      password
    })
  }

  if (role === 'seller') return redirect('/seller')
  
  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo)
  }
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
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match', success: false }
  }
  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters', success: false }
  }

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
    return { error: updateError.message, success: false }
  }

  return { error: null, success: true }
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required', success: false }

  const supabase = await createClient()
  
  // In a real app, this sends an email. 
  // With Supabase, it relies on the project's email settings.
  // The user should get redirected to /update-password
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

export async function resetPassword(formData: FormData) {
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

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
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}
