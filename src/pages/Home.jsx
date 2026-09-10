import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestMagazine, getMagazines, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";
import MagazineCard from "../components/MagazineCard";
import { HomeSkeleton } from "../components/Skeleton";
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
      <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-6 bg-[#FBF7EE]">
        <p className="text-5xl mb-4" aria-hidden="true">
          📰
        </p>
        <h2 className="text-2xl font-black text-[#201D1A] tracking-tight">
          Edisi pertama belum terbit
        </h2>
        <p className="text-sm text-[#8A8474] mt-2 max-w-sm">
          Begitu redaksi menerbitkan majalah, edisi terbarunya akan langsung
          tampil di halaman ini.
        </p>
      </div>
    );
  }

  const tanggal = new Date(magazine.published_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FBF7EE] pb-20">
      {/* Masthead */}
      <div className="bg-[#201D1A] text-[#FBF7EE] px-4 sm:px-8 py-4 flex items-center justify-between border-b-4 border-[#F2A63B]">
        <span className="text-lg sm:text-xl font-black tracking-tight">
          Majalah Sekolah
        </span>
        <span className="text-xs text-[#C9C2B0] hidden sm:block">
          Terbitan digital untuk warga sekolah
        </span>
      </div>

      {/* Hero: latest edition */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-6">
        <div className="flex flex-wrap items-start gap-4">
          <h1 className="flex-1 min-w-[200px] text-3xl sm:text-5xl font-black text-[#201D1A] leading-[1.05] tracking-tight">
            {magazine.title}
          </h1>
          <div
            className="shrink-0 bg-[#F2A63B] text-[#201D1A] text-xs font-bold px-4 py-2.5 self-start"
            style={{
              clipPath:
                "polygon(0 0,100% 0,100% 40%,94% 50%,100% 60%,100% 100%,0 100%,0 60%,6% 50%,0 40%)",
            }}
          >
            Terbit {tanggal}
          </div>
        </div>

        {magazine.description && (
          <p className="mt-5 max-w-2xl text-[#3A362E] text-base leading-relaxed border-l-4 border-[#D6456B] pl-4">
            {magazine.description}
          </p>
        )}

        <a
          href="#flipbook"
          className="inline-block mt-6 text-sm font-bold text-[#201D1A] border-b-2 border-[#201D1A] hover:border-[#D6456B] hover:text-[#D6456B] transition-colors"
        >
          Baca edisi ini ↓
        </a>

        <div className="mt-10 grid grid-cols-3 divide-x divide-[#E4DCC8] border-y border-[#E4DCC8] py-4 text-center">
          <div>
            <div className="font-black text-[#201D1A]">Digital</div>
            <div className="text-xs text-[#8A8474]">Baca kapan saja</div>
          </div>
          <div>
            <div className="font-black text-[#201D1A]">Flipbook</div>
            <div className="text-xs text-[#8A8474]">Buka seperti buku</div>
          </div>
          <div>
            <div className="font-black text-[#201D1A]">Komentar</div>
            <div className="text-xs text-[#8A8474]">Tinggalkan kesan</div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 space-y-14">
        {/* Flipbook viewer */}
        <section id="flipbook" className="pt-4">
          <div className="border-2 border-[#201D1A] p-2 sm:p-3 bg-white">
            <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
          </div>
        </section>

        {/* Comments */}
        <section className="max-w-3xl space-y-4">
          <div className="border-b-2 border-[#201D1A] pb-2">
            <h3 className="text-xl font-black text-[#201D1A]">
              Diskusi edisi ini
            </h3>
            <p className="text-xs text-[#8A8474] mt-1">
              Tulis pesan, saran, atau kesanmu tentang edisi ini.
            </p>
          </div>
          <CommentSection magazineId={magazine.id} />
        </section>

        {/* Archive */}
        {others.length > 0 && (
          <section className="space-y-6 border-t-2 border-[#201D1A] pt-8">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-black text-[#201D1A] tracking-tight">
                Arsip edisi lain
              </h2>
              <Link
                to="/magazines"
                className="text-sm font-bold text-[#201D1A] border-b-2 border-[#201D1A] hover:text-[#D6456B] hover:border-[#D6456B] transition-colors"
              >
                Lihat semua
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8">
              {others.map((m, i) => (
                <MagazineCard
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  thumb={thumbs[m.id]}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}