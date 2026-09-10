import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestMagazine, getMagazines, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";
import { HomeSkeleton, Skeleton } from "../components/Skeleton";
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

export default function Home() {
  const [magazine, setMagazine] = useState(null);
  const [others, setOthers] = useState([]);
  const [thumbs, setThumbs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLatestMagazine(), getMagazines()])
      .then(([latest, all]) => {
        if (cancelled) return;
        setMagazine(latest);
        const filtered = all.filter((m) => m.id !== latest?.id).slice(0, 4);
        setOthers(filtered);
        setLoading(false);

        Promise.all(
          filtered.map(async (m) => [m.id, await renderThumb(magazinePdfUrl(m.id))])
        ).then((entries) => {
          if (!cancelled) setThumbs(Object.fromEntries(entries));
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMagazine(null);
          setOthers([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <HomeSkeleton />;

  if (!magazine) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">
          📖
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Belum Ada Majalah</h2>
        <p className="text-sm text-slate-500 mt-1">
          Majalah edisi terbaru akan muncul di sini setelah dipublikasikan.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold uppercase tracking-wider">
          Edisi Terbaru
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {magazine.title}
        </h1>
        {magazine.description && (
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {magazine.description}
          </p>
        )}
        <time className="inline-block text-xs font-medium text-slate-400">
          {new Date(magazine.published_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </section>

      {/* Main Flipbook */}
      <section id="flipbook" className="bg-slate-900/5 p-2 sm:p-4 rounded-2xl shadow-inner">
        <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
      </section>

      {/* Comment Section */}
      <div className="max-w-4xl mx-auto pt-4">
        <CommentSection magazineId={magazine.id} />
      </div>

      {/* Majalah Lainnya */}
      {others.length > 0 && (
        <section className="pt-8 border-t border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Majalah Lainnya</h2>
            <Link
              to="/magazines"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {others.map((m) => (
              <Link
                to={`/magazines/${m.id}`}
                key={m.id}
                className="group flex flex-col space-y-2 focus:outline-none"
              >
                <div className="relative aspect-[3/4] w-full bg-slate-100 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 border border-slate-200/60">
                  {thumbs[m.id] ? (
                    <img
                      src={thumbs[m.id]}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <Skeleton className="w-full h-full absolute inset-0" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
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