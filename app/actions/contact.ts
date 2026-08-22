'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(1, 'Subject is required.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.')
})

export async function submitContact(prevState: any, formData: FormData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const subject = formData.get('subject')
  const message = formData.get('message')

  const parsed = contactSchema.safeParse({ name, email, subject, message })
  
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false }
  }

  try {
    const supabase = await createClient()
    
    // Save to database
    const { error: dbError } = await supabase.from('contact_messages').insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message
    })

    if (dbError) {
      console.error('Contact submission error:', dbError)
      return { error: 'An error occurred while saving your message.', success: false }
    }

    // Send email using FormSubmit
    const emailResponse = await fetch('https://formsubmit.co/ajax/abdulwaheed221221@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://nova-ecommerce.com',
        'Referer': 'https://nova-ecommerce.com/'
      },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message
      })
    })

    const emailData = await emailResponse.json()
    
    // If FormSubmit returns an error that isn't the initial Activation notice
    if (emailData.success === 'false' && emailData.message && !emailData.message.includes('Activation')) {
      console.error('Email sending error:', emailData)
      return { error: 'Failed to send the email notification. Please try again later.', success: false }
    }

    return { error: null, success: true }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { error: 'An unexpected error occurred.', success: false }
  }
}
