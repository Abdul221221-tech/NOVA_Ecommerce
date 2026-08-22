import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
        
        {/* Left: Image Gallery Skeleton */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4">
          <Skeleton className="w-full aspect-[4/3] rounded-3xl" />
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-24 h-24 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="w-full lg:w-[40%] flex flex-col pt-4 lg:pt-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-12 w-full mb-6" />
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          
          <Skeleton className="h-24 w-full mb-8" />
          
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-14 w-full rounded-2xl mt-8" />
          </div>
        </div>
        
      </div>
    </div>
  )
}
