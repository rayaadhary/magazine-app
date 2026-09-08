import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMagazines } from "../api";

export default function Magazines() {
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMagazines()
      .then(setMagazines)
      .catch(() => setMagazines([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Memuat...</div>;

  return (
    <div className="magazines-page">
      <h2>Majalah Sebelumnya</h2>
      {magazines.length === 0 ? (
        <p className="page-empty">Belum ada majalah.</p>
      ) : (
        <div className="magazines-grid">
          {magazines.map((m) => (
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
      )}
    </div>
  );
}
