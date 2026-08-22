import { generateReviewSummary } from '@/app/actions/ai'
import { Sparkles } from 'lucide-react'

export async function ReviewSummaryBlock({ productId }: { productId: string }) {
  const summary = await generateReviewSummary(productId)

  if (!summary) return null

  return (
    <div className="bg-muted/30 border rounded-xl p-6 mt-12 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles className="w-32 h-32" />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 text-accent-primary">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-heading font-bold text-lg">What reviewers are saying</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full ml-2">
            AI-Generated
          </span>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {summary}
        </p>
        
        <div className="pt-2">
          <a href="#reviews" className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-accent-primary transition-colors">
            Read all customer reviews ↓
          </a>
        </div>
      </div>
    </div>
  )
}
