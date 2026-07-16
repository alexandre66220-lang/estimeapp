import { parseMarkdown } from "@/lib/backoffice/markdown";

export function MarkdownPreview({ contenu }: { contenu: string }) {
  const blocks = parseMarkdown(contenu);

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === "h1") {
          return (
            <h3 key={i} className="text-base font-semibold text-[#EDEDED] mt-3 first:mt-0">
              {b.text}
            </h3>
          );
        }
        if (b.type === "h2") {
          return (
            <h4 key={i} className="text-sm font-semibold text-[#EDEDED] mt-2">
              {b.text}
            </h4>
          );
        }
        if (b.type === "li") {
          return (
            <p key={i} className="text-sm text-[#8B8B8D] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#4ADE80]">
              {b.text}
            </p>
          );
        }
        return (
          <p key={i} className="text-sm text-[#8B8B8D]">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
