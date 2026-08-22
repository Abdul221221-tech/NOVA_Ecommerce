import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingProducts() {
  return (
    <div className="container mx-auto px-4 md:px-8 xl:px-12 w-full max-w-[1600px] py-12 flex flex-col gap-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="font-heading text-4xl font-bold mb-2">
            <Skeleton className="h-10 w-48" />
          </h1>
          <Skeleton className="h-5 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden border border-border/50 bg-card rounded-2xl p-4 gap-4 h-[350px]">
            <Skeleton className="w-full h-3/5 rounded-xl" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
