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
        <p className="font-heading text-4xl text-text">Edisi tidak ditemukan.</p>
        <Link
          to="/"
          className="mt-6 inline-block border-b border-text pb-2 text-xs uppercase tracking-[0.2em] text-text hover:text-gold transition-colors"
          data-testid="reader-back-error"
        >
          Kembali ke arsip
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-text" data-testid="reader-page">
      <div className="mx-auto max-w-[1100px] px-12 py-16 sm:px-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-text-secondary hover:text-gold transition-colors mb-8"
          data-testid="reader-back"
        >
          <ArrowLeft size={15} />
          Kembali
        </Link>

        <header className="space-y-3 pb-8 border-b border-[#0A0A0A]/10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            {magazine.title}
          </h1>
          {magazine.description && (
            <p className="text-sm sm:text-base leading-relaxed text-text-secondary">
              {magazine.description}
            </p>
          )}
        </header>

        <section className="mt-10 overflow-hidden border border-[#0A0A0A]/10 bg-[url('https://images.unsplash.com/photo-1686806372785-fcfe9efa9b70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwyfHxjcmVhbXklMjBwYXBlciUyMHRleHR1cmUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc4ODE4NTU2NHww&ixlib=rb-4.1.0&q=85')] bg-cover bg-center shadow-[0_24px_64px_rgba(10,10,10,0.18)]" data-testid="reader-flipbook-wrapper">
          <div className="p-4 sm:p-8">
            <FlipbookViewer pdfUrl={magazinePdfUrl(magazine)} />
          </div>
        </section>

        <section className="mt-10">
          <CommentSection magazineId={magazine.id} />
        </section>
      </div>
    </div>
  );
}
