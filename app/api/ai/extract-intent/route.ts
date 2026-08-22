import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 })

    // Using gemini-1.5-flash for very fast, structured extraction
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        budget: z.number().nullable().describe('The maximum price mentioned, if any. Otherwise null.'),
        category: z.string().nullable().describe('The product category or type of item (e.g., "shoes", "dresses"). Null if none.'),
        color: z.string().nullable().describe('The color mentioned, if any.'),
        use_case: z.string().nullable().describe('The intent or use case (e.g., "running", "wedding").'),
        store_name: z.string().nullable().describe('If a specific store or seller name is mentioned (e.g., "from NikeStore" -> "NikeStore").')
      }),
      prompt: `Extract search parameters from the following user query for an e-commerce marketplace: "${query}". If a parameter is not explicitly mentioned, return null for it.`
    })

    return NextResponse.json(object)
  } catch (err: any) {
    console.error('Intent extraction failed:', err)
    return NextResponse.json({ error: 'Failed to extract intent' }, { status: 500 })
  }
}
