export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[#18181B] border border-[#232326] rounded-[10px] ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#232326]">
          <h2 className="text-sm font-semibold text-[#EDEDED]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
