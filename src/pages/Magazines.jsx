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
        <div className="pb-4" style={{ borderBottom: "1px solid #edf0f5" }}>
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-full aspect-[3/4] rounded-lg" />
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
      <header className="pb-4" style={{ borderBottom: "1px solid #edf0f5" }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#1a2a42" }}>
          Arsip Majalah
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b7a90" }}>
          Semua edisi majalah yang pernah diterbitkan.
        </p>
      </header>

      {/* Grid Content */}
      {magazines.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5"
            style={{ background: "linear-gradient(135deg, #e8a838 0%, #f0c060 100%)" }}>
            <span role="img" aria-hidden="true">📚</span>
          </div>
          <h2 className="text-lg font-bold" style={{ color: "#1a2a42" }}>
            Belum Ada Majalah
          </h2>
          <p className="text-sm mt-2" style={{ color: "#6b7a90" }}>
            Arsip majalah akan ditampilkan di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {magazines.map((m) => (
            <Link
              to={`/magazines/${m.id}`}
              key={m.id}
              className="group flex flex-col space-y-3 focus:outline-none"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg"
                style={{
                  background: "#1a2a42",
                  boxShadow: "0 2px 8px rgba(15,36,71,0.1)",
                }}>
                {thumbs[m.id] ? (
                  <img
                    src={thumbs[m.id]}
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full">
                    <Skeleton className="w-full h-full" />
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to top, rgba(15,36,71,0.5) 0%, transparent 50%)" }} />
              </div>
              <span className="text-sm font-semibold line-clamp-2 transition-colors"
                style={{ color: "#1a2a42" }}
                onMouseEnter={(e) => (e.target.style.color = "#e8a838")}
                onMouseLeave={(e) => (e.target.style.color = "#1a2a42")}>
                {m.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
