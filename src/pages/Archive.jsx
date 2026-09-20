import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMagazines, magazinePdfUrl } from "../api";
import { Skeleton } from "../components/Skeleton";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
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

export default function Archive() {
  const [thumbs, setThumbs] = useState({});

  const { data: magazines = [], isLoading } = useQuery({
    queryKey: ["magazines"],
    queryFn: getMagazines,
  });

  if (magazines.length > 0 && Object.keys(thumbs).length < magazines.length) {
    Promise.all(
      magazines.map(async (m) => [m.id, await renderThumb(magazinePdfUrl(m))])
    ).then((entries) => {
      const newThumbs = Object.fromEntries(entries);
      if (JSON.stringify(newThumbs) !== JSON.stringify(thumbs)) {
        setThumbs(newThumbs);
      }
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1380px] px-12 py-24 sm:px-16 lg:px-16 space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`${i === 1 ? "md:col-span-8" : i <= 3 ? "md:col-span-4" : "md:col-span-3"} space-y-3`}>
              <Skeleton className="w-full aspect-[3/4]" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-text" data-testid="archive-page">
      <main className="mx-auto max-w-[1380px] px-12 py-24 sm:px-16 lg:px-16 lg:py-32">
        <div className="flex flex-col justify-between gap-8 border-b border-[#0A0A0A]/10 pb-16 sm:flex-row sm:items-end">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary hover:text-gold transition-colors"
              data-testid="archive-back"
            >
              <ArrowLeft size={15} />
              Kembali ke reader
            </Link>
            <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
              Koleksi lengkap
            </div>
            <h1 className="mt-2 font-heading text-5xl leading-none sm:text-6xl font-black tracking-tight">
              Etalase majalah
            </h1>
            <p className="mt-4 max-w-[520px] text-sm leading-6 text-text-secondary">
              Semua edisi majalah yang pernah diterbitkan oleh Sittah Magazine.
            </p>
          </div>
        </div>

        {magazines.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 flex items-center justify-center text-3xl mb-5 bg-[#0A0A0A]">
              <BookOpen className="text-gold" size={28} />
            </div>
            <h2 className="text-lg font-bold text-text">Belum Ada Majalah</h2>
            <p className="text-sm mt-2 text-text-secondary">Arsip majalah akan ditampilkan di sini.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            {magazines.map((m, i) => (
              <Link
                to={`/read/${m.id}`}
                key={m.id}
                className={`group flex flex-col focus:outline-none ${i === 0 ? "md:col-span-8" : i <= 2 ? "md:col-span-4" : "md:col-span-3"}`}
                data-testid={`archive-card-${m.id}`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden border border-[#0A0A0A]/15 border-t-gold bg-cream transition-colors group-hover:border-gold">
                  {thumbs[m.id] ? (
                    <img
                      src={thumbs[m.id]}
                      alt={m.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gold">
                    {new Date(m.published_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                  </div>
                  <span className="mt-1 text-sm font-bold text-text leading-snug line-clamp-2 group-hover:text-gold transition-colors flex items-center gap-1.5">
                    {m.title}
                    <ArrowUpRight size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
