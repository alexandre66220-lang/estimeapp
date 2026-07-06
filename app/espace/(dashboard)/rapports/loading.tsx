export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16 animate-pulse">
      <div className="h-8 w-40 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-64 bg-dusk/8 rounded mb-8" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white border border-dusk/8 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
