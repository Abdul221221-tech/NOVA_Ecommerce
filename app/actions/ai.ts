'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function generateReviewSummary(productId: string) {
  try {
    const supabase = await createClient()
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, comment')
      .eq('product_id', productId)

    if (!reviews || reviews.length === 0) return null

    // We only summarize if there are enough reviews to matter (e.g. at least 1)
    const reviewText = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n')

    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are a helpful e-commerce assistant summarizing product reviews. 
        CRITICAL RULES:
        1. You must ONLY use the provided review text.
        2. Do NOT invent, assume, or hallucinate features, claims, or complaints that are not in the text.
        3. Synthesize the general pros and cons concisely in one short paragraph.
        4. If the reviews mention specific sizing or quality issues, highlight them.`,
      prompt: `Summarize the following customer reviews:\n\n${reviewText}`
    })

    return text
  } catch (error) {
    console.error('Failed to generate summary:', error)
    return null
  }
}
