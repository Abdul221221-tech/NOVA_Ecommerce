'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ProfileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email(),
  mobile_number: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional()
})

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

export async function updateProfile(formData: FormData): Promise<{ error?: string, success?: boolean }> {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // 1. Zod Validation
  const parsed = ProfileUpdateSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    mobile_number: formData.get('mobile_number') || undefined,
    date_of_birth: formData.get('date_of_birth') || undefined,
    gender: formData.get('gender') || undefined
  })

  if (!parsed.success) {
    return { error: parsed.error.message || 'Invalid input' }
  }

  const { name, email, mobile_number, date_of_birth, gender } = parsed.data
  const photo = formData.get('photo') as File | null

  try {
    // 2. Handle Secure Photo Upload
    let profile_photo_url = formData.get('existing_photo_url') as string
    
    if (photo && photo.size > 0) {
      // 5MB limit
      if (photo.size > 5 * 1024 * 1024) {
        return { error: 'Profile photo must be less than 5MB' }
      }

      // MIME Type and Extension validation (Basic defense against disguised executables)
      if (!ALLOWED_MIME_TYPES.includes(photo.type)) {
        return { error: 'Profile photo must be a JPG, PNG, or WEBP image' }
      }

      const originalExt = photo.name.split('.').pop()?.toLowerCase() || ''
      if (!ALLOWED_EXTENSIONS.includes(originalExt)) {
        return { error: 'Invalid file extension. Only JPG, PNG, and WEBP are allowed.' }
      }

      // Force a safe file extension based on the MIME type to prevent bypassing
      const safeExt = photo.type === 'image/jpeg' ? 'jpg' : photo.type === 'image/png' ? 'png' : 'webp'
      const secureFileName = `${user.id}-${crypto.randomUUID()}.${safeExt}`

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(secureFileName, photo, {
          upsert: true
        })

      if (uploadError) {
        console.error("Avatar upload error")
        return { error: 'Failed to upload profile photo' }
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(secureFileName)
      
      profile_photo_url = publicUrl
    }

    // 3. Update Auth Email (if changed)
    if (email && email !== user.email) {
      const { error: updateAuthError } = await supabase.auth.updateUser({ email })
      if (updateAuthError) {
        return { error: 'Failed to update email address' }
      }
    }

    // 4. Update Profiles Table
    const updateData = {
      name,
      email,
      mobile_number: mobile_number || null,
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      profile_photo_url
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error("Profile update error") // mask original error
      return { error: 'Failed to save profile information' }
    }

    revalidatePath('/account')
    revalidatePath('/', 'layout') 
    return { success: true }
    
  } catch (err: any) {
    console.error("Unexpected error in updateProfile") // mask original error
    return { error: 'An unexpected error occurred' }
  }
}
