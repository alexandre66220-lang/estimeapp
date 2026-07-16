export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-8 py-6 border-b border-[#232326]">
      <h1 className="text-lg font-semibold text-[#EDEDED]">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-[#8B8B8D]">{subtitle}</p>}
    </header>
  );
}
