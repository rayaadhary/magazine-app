import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestMagazine, getMagazines, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

async function renderThumb(pdfUrl) {
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 0.6 });
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
    Promise.all([getLatestMagazine(), getMagazines()])
      .then(async ([latest, all]) => {
        setMagazine(latest);
        const filtered = all.filter((m) => m.id !== latest?.id).slice(0, 4);
        setOthers(filtered);
        const entries = await Promise.all(
          filtered.map(async (m) => [m.id, await renderThumb(magazinePdfUrl(m.id))])
        );
        setThumbs(Object.fromEntries(entries));
      })
      .catch(() => { setMagazine(null); setOthers([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat...</div>;
  if (!magazine) return <div className="page-empty">Belum ada majalah yang dipublikasikan.</div>;

  return (
    <div className="home-page">
      <section className="home-hero">
        <h1 className="home-hero-title">{magazine.title}</h1>
        {magazine.description && <p className="home-hero-desc">{magazine.description}</p>}
        <time className="home-hero-date">
          {new Date(magazine.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </time>
      </section>

      <section id="flipbook">
        <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
      </section>

      <CommentSection magazineId={magazine.id} />

      {others.length > 0 && (
        <section className="home-others">
          <div className="home-section-header">
            <h2 className="home-section-title">Majalah Lainnya</h2>
            <Link to="/magazines" className="home-section-link">Lihat Semua</Link>
          </div>
          <div className="magazines-shelf">
            <div className="shelf-row">
              {others.map((m) => (
                <Link to={`/magazines/${m.id}`} key={m.id} className="shelf-item">
                  {thumbs[m.id] ? (
                    <img src={thumbs[m.id]} alt={m.title} className="shelf-cover" />
                  ) : (
                    <div className="shelf-cover-placeholder">PDF</div>
                  )}
                  <span className="shelf-title">{m.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
