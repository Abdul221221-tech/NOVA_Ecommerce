'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'platform_admin') {
    throw new Error('Unauthorized')
  }
  return { supabase, user }
}

async function logActivity(supabase: any, adminId: string, action: string, targetType: string, targetId: string, details: string) {
  await supabase.from('admin_activity_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details
  })
}

export async function approveStore(storeId: string) {
  const { supabase, user } = await checkAdmin()
  const { error } = await supabase.from('stores').update({ 
    status: 'approved', 
    suspension_reason: null,
    rejection_reason: null,
    approved_at: new Date().toISOString(),
    approved_by: user.id
  }).eq('id', storeId)
  if (error) throw new Error(error.message)
  
  await logActivity(supabase, user.id, 'APPROVE_STORE', 'stores', storeId, 'Approved seller store application')
  revalidatePath('/admin/sellers')
  revalidatePath(`/admin/sellers/${storeId}`)
}

export async function rejectStore(storeId: string, reason: string) {
  const { supabase, user } = await checkAdmin()
  const { error } = await supabase.from('stores').update({ 
    status: 'pending', // Keeps them pending but rejected, or we can use 'suspended'
    rejection_reason: reason,
    rejected_at: new Date().toISOString(),
    rejected_by: user.id
  }).eq('id', storeId)
  if (error) throw new Error(error.message)
  
  await logActivity(supabase, user.id, 'REJECT_STORE', 'stores', storeId, `Rejected store application. Reason: ${reason}`)
  revalidatePath('/admin/sellers')
  revalidatePath(`/admin/sellers/${storeId}`)
}

export async function suspendStore(storeId: string, reason: string) {
  const { supabase, user } = await checkAdmin()
  const { error } = await supabase.from('stores').update({ 
    status: 'suspended', 
    suspension_reason: reason,
    suspended_at: new Date().toISOString(),
    suspended_by: user.id
  }).eq('id', storeId)
  if (error) throw new Error(error.message)

  await logActivity(supabase, user.id, 'SUSPEND_STORE', 'stores', storeId, `Suspended active store. Reason: ${reason}`)
  revalidatePath('/admin/sellers')
  revalidatePath(`/admin/sellers/${storeId}`)
}

export async function reactivateStore(storeId: string) {
  const { supabase, user } = await checkAdmin()
  const { error } = await supabase.from('stores').update({ 
    status: 'approved', 
    suspension_reason: null,
    suspended_at: null,
    suspended_by: null
  }).eq('id', storeId)
  if (error) throw new Error(error.message)

  await logActivity(supabase, user.id, 'REACTIVATE_STORE', 'stores', storeId, 'Reactivated suspended store')
  revalidatePath('/admin/sellers')
  revalidatePath(`/admin/sellers/${storeId}`)
}

export async function approveProduct(productId: string) {
  const { supabase, user } = await checkAdmin()
  const { error } = await supabase.from('products').update({ 
    approval_status: 'approved',
    rejection_reason: null
  }).eq('id', productId)
  if (error) throw new Error(error.message)

  await logActivity(supabase, user.id, 'APPROVE_PRODUCT', 'products', productId, 'Approved product')
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}`)
}

export async function rejectProduct(productId: string, reason: string) {
  const { supabase, user } = await checkAdmin()
  const { error } = await supabase.from('products').update({ 
    approval_status: 'rejected',
    rejection_reason: reason
  }).eq('id', productId)
  if (error) throw new Error(error.message)

  await logActivity(supabase, user.id, 'REJECT_PRODUCT', 'products', productId, `Rejected product. Reason: ${reason}`)
  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${productId}`)
}
