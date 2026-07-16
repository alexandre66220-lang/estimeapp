const STYLES = {
  success: { dot: "bg-[#4ADE80]", bg: "bg-[#4ADE80]/10", text: "text-[#4ADE80]" },
  warning: { dot: "bg-[#FBBF24]", bg: "bg-[#FBBF24]/10", text: "text-[#FBBF24]" },
  error: { dot: "bg-[#F87171]", bg: "bg-[#F87171]/10", text: "text-[#F87171]" },
  neutral: { dot: "bg-[#8B8B8D]", bg: "bg-[#8B8B8D]/10", text: "text-[#8B8B8D]" },
} as const;

export type StatusTone = keyof typeof STYLES;

export function StatusBadge({ tone, label }: { tone: StatusTone; label: string }) {
  const s = STYLES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${s.bg} ${s.text} text-xs font-medium px-2 py-0.5 rounded-full`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
