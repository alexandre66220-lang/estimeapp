export function StatCard({
  label,
  value,
  sublabel,
  accent = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#18181B] border border-[#232326] rounded-[10px] p-5">
      <p className="text-xs font-medium text-[#8B8B8D] uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? "text-[#4ADE80]" : "text-[#EDEDED]"}`}>
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-[#55555A]">{sublabel}</p>}
    </div>
  );
}
