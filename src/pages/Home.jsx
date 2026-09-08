import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLatestMagazine, getMagazines, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";

export default function Home() {
  const [magazine, setMagazine] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLatestMagazine(), getMagazines()])
      .then(([latest, all]) => {
        setMagazine(latest);
        setOthers(all.filter((m) => m.id !== latest?.id).slice(0, 4));
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
        <a href="#flipbook" className="home-hero-btn">Baca Sekarang</a>
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
          <div className="magazines-grid">
            {others.map((m) => (
              <Link to={`/magazines/${m.id}`} key={m.id} className="magazine-card">
                <div className="magazine-card-cover">
                  <span className="cover-placeholder">PDF</span>
                </div>
                <div className="magazine-card-info">
                  <h3>{m.title}</h3>
                  {m.description && <p>{m.description}</p>}
                  <time>{new Date(m.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</time>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
