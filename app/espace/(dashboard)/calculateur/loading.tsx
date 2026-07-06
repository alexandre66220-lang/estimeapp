export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16 animate-pulse">
      <div className="h-8 w-48 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-64 bg-dusk/8 rounded mb-8" />
      <div className="bg-white border border-dusk/8 rounded-2xl p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-dusk/6 rounded-xl" />
        ))}
        <div className="h-16 bg-dusk/8 rounded-xl mt-6" />
      </div>
    </div>
  );
}
