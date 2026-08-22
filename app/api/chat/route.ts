import { streamText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: `You are NOVA's AI Customer Support Agent. You are helpful, friendly, and concise.
You must answer questions strictly based on the following website policies and the provided tools.
If you do not know the answer or the tools do not return relevant information, state clearly that you don't know, rather than making up information.

CRITICAL POLICIES:
- Return Policy: We offer a 10-day hassle-free return window for unworn items in original packaging. Some final-sale items may be excluded.
- Shipping: Standard shipping takes 3-5 business days. Express shipping is 1-2 days. Shipping is FREE on orders above ₹351.
- Payments: 100% secure checkout. Your chosen payment method is charged immediately upon order confirmation.

Your persona should feel premium, matching the brand (Apple + premium fashion marketplace). Do not use excessive emojis.
`,
    messages,
    tools: {
      searchProducts: tool({
        description: 'Search for active products on the NOVA store by name, category, or description.',
        parameters: z.object({
          query: z.string().describe('The search query (e.g., "shoes", "t-shirt", "electronics")'),
        }),
        execute: async ({ query }: { query: string }): Promise<any> => {
          const supabase = await createClient()
          const { data, error } = await supabase
            .from('products')
            .select('id, name, description, status')
            .eq('status', 'active')
            .ilike('name', `%${query}%`)
            .limit(5)
          
          if (error) {
            console.error("Supabase search error:", error)
            return { error: "Failed to search products." }
          }
          
          if (!data || data.length === 0) {
            return { message: "No products found matching the query." }
          }
          
          return { products: data }
        },
      }),
    },
  });

  return (result as any).toDataStreamResponse?.() ?? (result as any).toTextStreamResponse();
}
