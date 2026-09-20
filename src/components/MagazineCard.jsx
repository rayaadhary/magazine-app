import { Link } from "react-router-dom";
import { Skeleton } from "./Skeleton";

export default function MagazineCard({ id, title, thumb }) {
  return (
    <Link
      to={`/read/${id}`}
      className="group flex flex-col space-y-3 focus:outline-none"
      data-testid={`magazine-card-${id}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0A0A]">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(to_top,rgba(10,10,10,0.5),transparent)]" />
      </div>
      <span className="text-sm font-semibold leading-snug line-clamp-2 text-text group-hover:text-gold transition-colors">
        {title}
      </span>
    </Link>
  );
}
