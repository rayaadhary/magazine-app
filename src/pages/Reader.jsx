import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMagazine, magazinePdfUrl, trackMagazine } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";
import { DetailSkeleton } from "../components/Skeleton";
import { ArrowLeft } from "lucide-react";

export default function Reader() {
  const { id } = useParams();
  const readTracked = useRef(false);

  const { data: magazine, isLoading, isError } = useQuery({
    queryKey: ["magazine", id],
    queryFn: () => getMagazine(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    const key = `sittah_tracked_${id}`;
    if (!sessionStorage.getItem(key)) {
      trackMagazine(id, "visit").catch(() => {});
      sessionStorage.setItem(key, "1");
    }
  }, [id]);

  useEffect(() => {
    if (!id || readTracked.current) return;
    const timer = setTimeout(() => {
      const readKey = `sittah_read_${id}`;
      if (!sessionStorage.getItem(readKey)) {
        trackMagazine(id, "read").catch(() => {});
        sessionStorage.setItem(readKey, "1");
      }
      readTracked.current = true;
    }, 5000);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !magazine) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <p className="font-heading text-4xl text-navy">Edisi tidak ditemukan.</p>
        <Link
          to="/"
          className="mt-6 inline-block border-b border-navy pb-2 text-xs uppercase tracking-[0.2em] text-navy hover:text-gold transition-colors"
          data-testid="reader-back-error"
        >
          Kembali ke arsip
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm text-navy" data-testid="reader-page">
      <div className="mx-auto max-w-[1100px] px-5 py-8 sm:px-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted hover:text-gold transition-colors mb-6"
          data-testid="reader-back"
        >
          <ArrowLeft size={15} />
          Kembali
        </Link>

        <header className="space-y-3 pb-6 border-b border-navy/10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            {magazine.title}
          </h1>
          {magazine.description && (
            <p className="text-sm sm:text-base leading-relaxed text-muted">
              {magazine.description}
            </p>
          )}
        </header>

        <section className="mt-8 rounded-2xl overflow-hidden border border-navy/10 bg-white" data-testid="reader-flipbook-wrapper">
          <div className="p-2 sm:p-4">
            <FlipbookViewer pdfUrl={magazinePdfUrl(magazine)} />
          </div>
        </section>

        <section className="mt-8">
          <CommentSection magazineId={magazine.id} />
        </section>
      </div>
    </div>
  );
}
