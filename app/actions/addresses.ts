'use server'

import { createClient } from '@/lib/supabase/server'

export type Address = {
  id: string
  user_id: string
  label: string
  name: string
  mobile_number: string
  address: string
  city: string
  state: string
  pincode: string
  is_default: boolean
  created_at: string
}

export type AddressInput = Omit<Address, 'id' | 'user_id' | 'created_at'>

export async function getUserAddresses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    // If the table doesn't exist yet, we'll get an error, but let's handle it gracefully
    return { success: false, error: error.message, addresses: [] }
  }

  return { success: true, addresses: data as Address[] }
}

export async function addUserAddress(addressInput: AddressInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // If this address is set as default, we need to unset the others
  if (addressInput.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .insert({
      ...addressInput,
      user_id: user.id
    })
    .select('*')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, address: data as Address }
}

export async function updateUserAddress(id: string, addressInput: AddressInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // If this address is set as default, we need to unset the others
  if (addressInput.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('user_addresses')
    .update(addressInput)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, address: data as Address }
}

export async function deleteUserAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
