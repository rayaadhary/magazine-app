import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMagazine, magazinePdfUrl } from "../api";
import FlipbookViewer from "../components/FlipbookViewer";
import CommentSection from "../components/CommentSection";

export default function MagazineDetail() {
  const { id } = useParams();
  const [magazine, setMagazine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMagazine(id)
      .then(setMagazine)
      .catch(() => setMagazine(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Memuat...</div>;
  if (!magazine) return <div className="page-empty">Majalah tidak ditemukan.</div>;

  return (
    <div className="home-page">
      <h2 className="magazine-title">{magazine.title}</h2>
      {magazine.description && <p className="magazine-desc">{magazine.description}</p>}
      <FlipbookViewer pdfUrl={magazinePdfUrl(magazine.id)} />
      <CommentSection magazineId={magazine.id} />
    </div>
  );
}
