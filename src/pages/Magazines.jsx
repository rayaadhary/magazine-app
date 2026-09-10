import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMagazines, magazinePdfUrl } from "../api";
import { Skeleton } from "../components/Skeleton";
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

export default function Magazines() {
  const [magazines, setMagazines] = useState([]);
  const [thumbs, setThumbs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMagazines()
      .then((list) => {
        if (cancelled) return;
        setMagazines(list);
        setLoading(false);

        Promise.all(
          list.map(async (m) => [
            m.id,
            await renderThumb(magazinePdfUrl(m.id)),
          ]),
        ).then((entries) => {
          if (!cancelled) setThumbs(Object.fromEntries(entries));
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMagazines([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="border-b border-slate-200/80 pb-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full aspect-[3/4] rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <header className="border-b border-slate-200/80 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Majalah Sebelumnya
        </h1>
      </header>

      {/* Grid Content */}
      {magazines.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">
            📚
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Belum Ada Majalah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Arsip majalah akan ditampilkan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {magazines.map((m) => (
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
      )}
    </div>
  );
}
