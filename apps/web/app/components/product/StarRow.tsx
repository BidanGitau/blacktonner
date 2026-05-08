import { Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

interface Props {
  rating: number;
  reviews?: number;
  size?: "sm" | "lg";
}

export function StarRow({ rating, reviews, size = "sm" }: Props) {
  const filled = Math.round(rating);
  const icon = size === "lg" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className={`flex items-center ${size === "lg" ? "gap-1.5" : "gap-1"}`}>
      <div className="flex items-center gap-0.5">
        {STARS.map((s) => (
          <Star
            key={s}
            className={`${icon} ${s <= filled ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`}
          />
        ))}
      </div>
      {size === "lg" ? (
        <>
          <span className="text-sm font-semibold text-slate-700">{rating}</span>
          {reviews !== undefined && (
            <span className="text-sm text-blue-600">({reviews} reviews)</span>
          )}
        </>
      ) : reviews !== undefined ? (
        <span className="text-[11px] text-blue-600 ml-0.5">{reviews}</span>
      ) : (
        <span className="text-[11px] text-slate-500 ml-1">{rating}</span>
      )}
    </div>
  );
}
