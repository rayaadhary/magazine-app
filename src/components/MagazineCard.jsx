import { Link } from "react-router-dom";
import { Skeleton } from "./Skeleton";

// Alternating "pin" colors so the archive grid reads like a corkboard,
// not a row of identical SaaS cards.
const PIN_COLORS = ["#F2A63B", "#D6456B", "#1F7A72"];

export default function MagazineCard({ id, title, thumb, index = 0 }) {
  const pin = PIN_COLORS[index % PIN_COLORS.length];

  return (
    <Link
      to={`/magazines/${id}`}
      className="group flex flex-col gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A72] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF7EE]"
    >
      <div className="relative aspect-[3/4] w-full bg-[#201D1A] border-2 border-[#201D1A] overflow-hidden transition-transform duration-200 ease-out group-hover:-rotate-1 group-hover:-translate-y-0.5">
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 rotate-3 z-10"
          style={{ backgroundColor: pin }}
          aria-hidden="true"
        />
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
      </div>
      <span className="text-sm font-semibold text-[#201D1A] leading-snug line-clamp-2 group-hover:text-[#D6456B] transition-colors">
        {title}
      </span>
    </Link>
  );
}