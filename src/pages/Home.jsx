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

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10 sm:py-10 text-center shadow-xl border border-white/10"
        style={{
          background:
            "radial-gradient(circle at top, #1a3666 0%, #0f2447 70%, #081427 100%)",
        }}
      >
        {/* Background Overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
            <span className="px-3.5 py-1 rounded-full text-[14px] font-extrabold tracking-widest text-white whitespace-nowrap shrink-0">
              Majalah Digital SMP Musix
            </span>

            <img
              src="/logo-sittah.png"
              alt="Sittah Magazine"
              className="h-20 sm:h-28 w-auto object-contain drop-shadow-md shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />

            <span className="px-3.5 py-1 rounded-full text-[14px] font-extrabold tracking-widest text-white whitespace-nowrap shrink-0">
              Majalah Digital SMP Musix
            </span>
          </div>


          {/* Badge Edisi */}

          {/* Judul Edisi */}
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wide leading-tight drop-shadow-sm">
            <span style={{ color: "#f0b828" }}>SITTAH</span> MAGAZINE
          </h1>

          {/* Deskripsi */}
          <p
            className="text-xs sm:text-sm leading-relaxed max-w-md font-normal"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {magazine
              ? magazine.description
              : "Majalah edisi terbaru akan muncul di sini setelah dipublikasikan."}
          </p>

          {/* Tanggal Publikasi */}
          {magazine && (
            <div className="pt-1">
              <time
                className="inline-block px-3 py-1 rounded-md text-[11px] font-medium tracking-wide"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                Dipublikasikan: {formatDate(magazine.published_at)}
              </time>
            </div>
          )}
        </div>
      </section>

      {/* Main Flipbook */}
      {magazine && (
        <>
          <section
            id="flipbook"
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{
              background: "rgba(15, 36, 71, 0.03)",
              border: "1px solid #edf0f5",
            }}
          >
            <div className="p-2 sm:p-4">
              <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
            </div>
          </section>

          {/* Comment Section */}
          <div className="max-w-4xl mx-auto pt-4">
            <CommentSection magazineId={magazine.id} />
          </div>
        </>
      )}

      {/* Majalah Lainnya */}
      {others.length > 0 && (
        <section
          className="pt-8 space-y-6"
          style={{ borderTop: "1px solid #edf0f5" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#1a2a42]">
              Majalah Lainnya
            </h2>
            <Link
              to="/magazines"
              className="text-sm font-bold transition-colors"
              style={{ color: "#4a7bc8" }}
              onMouseEnter={(e) => (e.target.style.color = "#2c5294")}
              onMouseLeave={(e) => (e.target.style.color = "#4a7bc8")}
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {others.map((m) => (
              <Link
                to={`/magazines/${m.id}`}
                key={m.id}
                className="group flex flex-col space-y-3 focus:outline-none"
              >
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-lg"
                  style={{
                    background: "#1a2a42",
                    boxShadow: "0 2px 8px rgba(15,36,71,0.1)",
                  }}
                >
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
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(15,36,71,0.5) 0%, transparent 50%)",
                    }}
                  />
                </div>
                <span
                  className="text-sm font-semibold line-clamp-2 transition-colors"
                  style={{ color: "#1a2a42" }}
                  onMouseEnter={(e) => (e.target.style.color = "#e8a838")}
                  onMouseLeave={(e) => (e.target.style.color = "#1a2a42")}
                >
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