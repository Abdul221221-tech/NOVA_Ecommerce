'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData): Promise<{ error?: string, success?: boolean }> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // Extract fields
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const mobile_number = formData.get('mobile_number') as string
  const date_of_birth = formData.get('date_of_birth') as string
  const gender = formData.get('gender') as string

  const photo = formData.get('photo') as File | null

  try {
    // 1. Handle Photo Upload (if provided)
    let profile_photo_url = formData.get('existing_photo_url') as string
    
    if (photo && photo.size > 0) {
      // Validate photo type
      if (!photo.type.startsWith('image/')) {
        return { error: 'Profile photo must be an image file' }
      }

      // 5MB limit
      if (photo.size > 5 * 1024 * 1024) {
        return { error: 'Profile photo must be less than 5MB' }
      }

      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, photo, {
          upsert: true
        })

      if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        return { error: 'Failed to upload profile photo' }
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      profile_photo_url = publicUrl
    }

    // 2. Update Auth Email (if changed)
    if (email && email !== user.email) {
      const { error: updateAuthError } = await supabase.auth.updateUser({ email })
      if (updateAuthError) {
        console.error("Auth update error:", updateAuthError)
        return { error: updateAuthError.message }
      }
    }

    // 3. Update Profiles Table
    const updateData = {
      name,
      email, // We also update it in profiles table for sync
      mobile_number,
      date_of_birth: date_of_birth || null,
      gender,
      profile_photo_url
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return { error: 'Failed to save profile information' }
    }

    revalidatePath('/account')
    revalidatePath('/', 'layout') // revalidate header
    return { success: true }
    
  } catch (err: any) {
    console.error("Unexpected error in updateProfile:", err)
    return { error: 'An unexpected error occurred' }
  }
}
