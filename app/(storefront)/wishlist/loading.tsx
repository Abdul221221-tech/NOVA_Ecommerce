export default function WishlistLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="h-10 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
      <div className="h-4 w-32 bg-muted rounded-md animate-pulse mb-8"></div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="aspect-square bg-muted rounded-xl animate-pulse"></div>
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
