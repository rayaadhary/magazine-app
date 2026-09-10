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
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp })
      .promise;
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
          filtered.map(async (m) => [
            m.id,
            await renderThumb(magazinePdfUrl(m.id)),
          ]),
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
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50">
        <div className="w-20 h-20 bg-slate-900/10 text-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-slate-200">
          📰
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Belum Ada Edisi Majalah
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Majalah digital sekolah edisi terbaru akan segera dipublikasikan di
          sini.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 space-y-12">
      {/* Hero Banner Section (Navy Palette) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            Edisi Terbaru Sekolah
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {magazine.title}
          </h1>

          {magazine.description && (
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              {magazine.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              📅 Rilis:{" "}
              {new Date(magazine.published_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <a
              href="#flipbook"
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg transition-all shadow-md shadow-sky-500/20"
            >
              Baca Edisi Ini ↓
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-6 text-slate-300 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-xs">
              <div className="text-lg font-bold text-white">Edisi Digital</div>
              <div className="text-xs text-slate-400">Akses Kapan Saja</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-xs">
              <div className="text-lg font-bold text-white">Interaktif</div>
              <div className="text-xs text-slate-400">Mode Flipbook PDF</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-xs">
              <div className="text-lg font-bold text-white">Ruang Diskusi</div>
              <div className="text-xs text-slate-400">Komentar Reader</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Main Flipbook Viewer Card */}
        <section
          id="flipbook"
          className="bg-white p-3 sm:p-6 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 transition-all"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900" />
              <h2 className="text-lg font-bold text-slate-900">
                Pembaca Majalah Digital
              </h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              Mode HD
            </span>
          </div>

          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner p-1 sm:p-3">
            <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
          </div>
        </section>

        {/* Comment Section Container */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200/80 max-w-4xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xl font-bold text-slate-900">
              Diskusi & Resensi Edisi Ini
            </h3>
            <p className="text-xs text-slate-500">
              Tinggalkan pesan, saran, atau kesan Anda mengenai majalah ini.
            </p>
          </div>
          <CommentSection magazineId={magazine.id} />
        </section>

        {/* Majalah Lainnya Section */}
        {others.length > 0 && (
          <section className="pt-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Arsip & Edisi Lainnya
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jelajahi karya dan terbitan sekolah sebelumnya
                </p>
              </div>
              <Link
                to="/magazines"
                className="text-sm font-bold text-slate-900 hover:text-sky-600 flex items-center gap-1 transition-colors group"
              >
                Lihat Semua{" "}
                <span className="group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {others.map((m) => (
                <Link
                  to={`/magazines/${m.id}`}
                  key={m.id}
                  className="group flex flex-col space-y-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 focus:outline-none"
                >
                  <div className="relative aspect-[3/4] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200/60 shadow-inner">
                    {thumbs[m.id] ? (
                      <img
                        src={thumbs[m.id]}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <Skeleton className="w-full h-full absolute inset-0" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider block">
                      Arsip Majalah
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-sky-700 transition-colors">
                      {m.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
