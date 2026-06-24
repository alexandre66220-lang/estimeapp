import { Star } from "@phosphor-icons/react/dist/ssr";

export function EtoilesNote({ note, size = 14 }: { note: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${note} sur 5 étoiles`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          weight={value <= note ? "fill" : "regular"}
          className={value <= note ? "text-ambre" : "text-dusk/15"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
