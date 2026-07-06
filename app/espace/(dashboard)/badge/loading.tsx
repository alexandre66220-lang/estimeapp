export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:py-16 animate-pulse">
      <div className="h-8 w-56 bg-dusk/8 rounded mb-2" />
      <div className="h-4 w-72 bg-dusk/8 rounded mb-8" />
      <div className="h-72 bg-white border border-dusk/8 rounded-2xl" />
    </div>
  );
}
