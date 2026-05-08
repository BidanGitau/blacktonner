export function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 lg:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="aspect-square animate-pulse bg-stone-100" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse bg-stone-100" />
            <div className="h-10 w-3/4 animate-pulse bg-stone-100" />
            <div className="h-8 w-32 animate-pulse bg-stone-100" />
            <div className="mt-8 h-12 animate-pulse bg-stone-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
