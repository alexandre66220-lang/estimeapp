export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 animate-pulse">
      <div className="h-8 w-40 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-64 bg-dusk/8 rounded mb-6" />
      <div className="h-48 bg-white border border-dusk/8 rounded-2xl mb-8" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-dusk/8 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 bg-white border border-dusk/8 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
