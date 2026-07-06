export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 animate-pulse">
      <div className="h-8 w-40 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-56 bg-dusk/8 rounded mb-8" />
      <div className="h-10 w-72 bg-dusk/8 rounded-xl mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white border border-dusk/8 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-white border border-dusk/8 rounded-2xl mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-dusk/8 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
