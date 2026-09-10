import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMagazine, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";
import { DetailSkeleton } from "../components/Skeleton";

export default function MagazineDetail() {
  const { id } = useParams();
  const [magazine, setMagazine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMagazine(id)
      .then(setMagazine)
      .catch(() => setMagazine(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (!magazine) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5"
          style={{ background: "rgba(15, 36, 71, 0.06)" }}>
          <span role="img" aria-hidden="true">📄</span>
        </div>
        <h2 className="text-xl font-bold" style={{ color: "#1a2a42" }}>Majalah Tidak Ditemukan</h2>
        <p className="text-sm mt-2 mb-5" style={{ color: "#6b7a90" }}>
          Halaman atau berkas majalah ini mungkin telah dihapus.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all"
          style={{ background: "#2c5294", color: "#fff" }}
          onMouseEnter={(e) => (e.target.style.background = "#4a7bc8")}
          onMouseLeave={(e) => (e.target.style.background = "#2c5294")}
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info */}
      <header className="space-y-3 pb-6" style={{ borderBottom: "1px solid #edf0f5" }}>
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold mb-2 transition-colors"
          style={{ color: "#6b7a90" }}
          onMouseEnter={(e) => (e.target.style.color = "#4a7bc8")}
          onMouseLeave={(e) => (e.target.style.color = "#6b7a90")}
        >
          ← Kembali
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#1a2a42" }}>
          {magazine.title}
        </h1>
        {magazine.description && (
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#6b7a90" }}>
            {magazine.description}
          </p>
        )}
      </header>

      {/* Reader Container */}
      <section className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(15, 36, 71, 0.03)", border: "1px solid #edf0f5" }}>
        <div className="p-2 sm:p-4">
          <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
        </div>
      </section>

      {/* Discussion */}
      <section className="pt-4">
        <CommentSection magazineId={magazine.id} />
      </section>
    </div>
  );
}
