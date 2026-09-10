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
        <h2 className="text-xl font-semibold text-slate-800">Majalah Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Halaman atau berkas majalah ini mungkin telah dihapus.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info */}
      <header className="space-y-2 border-b border-slate-200/80 pb-6">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
        >
          &larr; Kembali
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {magazine.title}
        </h1>
        {magazine.description && (
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {magazine.description}
          </p>
        )}
      </header>

      {/* Reader Container */}
      <section className="bg-slate-900/5 p-2 sm:p-4 rounded-2xl shadow-inner">
        <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
      </section>

      {/* Discussion */}
      <section className="pt-4">
        <CommentSection magazineId={magazine.id} />
      </section>
    </div>
  );
}