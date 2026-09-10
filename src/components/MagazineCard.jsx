import { Link } from "react-router-dom";
import { Skeleton } from "./Skeleton";

export default function MagazineCard({ id, title, thumb }) {
  return (
    <Link
      to={`/magazines/${id}`}
      className="group flex flex-col space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a7bc8] focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg"
        style={{
          background: "#1a2a42",
          boxShadow: "0 2px 8px rgba(15,36,71,0.1)",
        }}>
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(15,36,71,0.5) 0%, transparent 50%)" }} />
      </div>
      <span className="text-sm font-semibold leading-snug line-clamp-2 transition-colors"
        style={{ color: "#1a2a42" }}
        onMouseEnter={(e) => (e.target.style.color = "#e8a838")}
        onMouseLeave={(e) => (e.target.style.color = "#1a2a42")}>
        {title}
      </span>
    </Link>
  );
}
