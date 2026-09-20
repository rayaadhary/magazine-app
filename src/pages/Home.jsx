import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLatestMagazine, getMagazines, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";
import { HomeSkeleton } from "../components/Skeleton";
import { ArrowRight, BookOpen } from "lucide-react";
import { pdfjs } from "react-pdf";

async function renderThumb(pdfUrl) {
  try {
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 0.4 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch {
    return null;
  }
}

function TopArchiveCard({ issue }) {
  return (
    <Link
      to={`/read/${issue.id}`}
      className="group flex min-w-[210px] snap-start items-center gap-3 border-2 border-navy/15 border-t-gold bg-white p-2 transition-colors hover:border-gold sm:min-w-[230px]"
      data-testid={`top-archive-card-${issue.id}`}
    >
      <div className="h-[64px] w-[48px] shrink-0 overflow-hidden bg-navy">
        {issue.thumb ? (
          <img src={issue.thumb} alt={issue.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gold">
            <BookOpen size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gold">
          {issue.issue_label || "Edisi"}
        </div>
        <div className="mt-0.5 text-sm font-bold text-navy leading-tight truncate group-hover:text-gold transition-colors">
          {issue.title}
        </div>
        <div className="mt-0.5 text-[11px] text-navy/60 line-clamp-1">
          {issue.description}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [thumbs, setThumbs] = useState({});

  const { data: magazine, isLoading: loadingLatest } = useQuery({
    queryKey: ["magazine", "latest"],
    queryFn: getLatestMagazine,
  });

  const { data: allMagazines = [], isLoading: loadingAll } = useQuery({
    queryKey: ["magazines"],
    queryFn: getMagazines,
  });

  const others = allMagazines.filter((m) => m.id !== magazine?.id).slice(0, 4);

  const topIssues = allMagazines.slice(0, 6).map((m) => ({
    ...m,
    thumb: thumbs[m.id] || null,
  }));

  if (allMagazines.length > 0 && Object.keys(thumbs).length < allMagazines.length) {
    Promise.all(
      allMagazines.map(async (m) => [m.id, await renderThumb(magazinePdfUrl(m))])
    ).then((entries) => {
      const newThumbs = Object.fromEntries(entries);
      if (JSON.stringify(newThumbs) !== JSON.stringify(thumbs)) {
        setThumbs(newThumbs);
      }
    });
  }

  if (loadingLatest || loadingAll) return <HomeSkeleton />;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-[1380px] px-12 py-24 sm:px-16 lg:px-16 space-y-24" data-testid="home-page">
      {/* Hero — solid navy, no gradient */}
      <section className="relative overflow-hidden bg-navy px-12 py-24 sm:px-16" data-testid="home-hero">
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-5 text-center">
          <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold border border-gold/30">
            Majalah Digital
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none font-heading">
            <span className="text-gold">SITTAH</span> MAGAZINE
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-md text-white/60">
            {magazine
              ? magazine.description
              : "Majalah edisi terbaru akan muncul di sini setelah dipublikasikan."}
          </p>
          {magazine && (
            <div className="flex items-center gap-4 text-[11px] text-white/50 font-medium">
              <time className="px-3 py-1 rounded bg-white/5">
                {formatDate(magazine.published_at)}
              </time>
              <Link
                to={`/read/${magazine.id}`}
                className="inline-flex items-center gap-1.5 text-gold hover:text-gold-rich transition-colors font-bold"
                data-testid="hero-read-now"
              >
                Baca Sekarang <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Top Archive Strip */}
      {topIssues.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Edisi Terbaru
            </h2>
            <Link
              to="/archive"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy/60 hover:text-gold transition-colors inline-flex items-center gap-1"
              data-testid="home-view-all-top"
            >
              Lihat Semua <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {topIssues.map((m) => (
              <TopArchiveCard key={m.id} issue={m} />
            ))}
          </div>
        </section>
      )}

      {/* Main Flipbook — cream texture bg, deep shadow, no radius */}
      {magazine && (
        <section className="overflow-hidden border-2 border-navy/10 bg-warm shadow-[0_24px_64px_rgba(11,35,66,0.14)]" data-testid="home-flipbook-wrapper">
          <div className="p-4 sm:p-8">
            <FlipbookViewer pdfUrl={magazinePdfUrl(magazine)} />
          </div>
        </section>
      )}

      {/* Comment */}
      {magazine && (
        <div className="max-w-4xl mx-auto">
          <CommentSection magazineId={magazine.id} />
        </div>
      )}

      {/* Majalah Lainnya — Bento Grid */}
      {others.length > 0 && (
        <section className="pt-16 border-t border-navy/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-navy font-heading tracking-tight">Majalah Lainnya</h2>
            <Link
              to="/archive"
              className="text-sm font-bold text-navy/60 hover:text-gold transition-colors inline-flex items-center gap-1"
              data-testid="home-view-all-others"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {others.map((m, i) => (
              <Link
                to={`/read/${m.id}`}
                key={m.id}
                className={`group flex flex-col space-y-3 focus:outline-none ${i === 0 ? "md:col-span-8" : "md:col-span-4"}`}
                data-testid={`home-magazine-card-${m.id}`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-navy">
                  {thumbs[m.id] ? (
                    <img
                      src={thumbs[m.id]}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(to_top,rgba(10,10,10,0.5),transparent)]" />
                </div>
                <span className="text-sm font-semibold line-clamp-2 text-navy group-hover:text-gold transition-colors">
                  {m.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
