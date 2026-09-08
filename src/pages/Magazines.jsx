import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMagazines, magazinePdfUrl } from "../api";
import * as pdfjsLib from "pdfjs-dist";

async function renderThumb(pdfUrl) {
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);
    const vp = page.getViewport({ scale: 0.4 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    return canvas.toDataURL("image/jpeg", 0.6);
  } catch {
    return null;
  }
}

export default function Magazines() {
  const [magazines, setMagazines] = useState([]);
  const [thumbs, setThumbs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMagazines()
      .then((list) => {
        if (cancelled) return;
        setMagazines(list);
        setLoading(false);
        // ponytail: thumbnails load async, don't block page render
        Promise.all(
          list.map(async (m) => [m.id, await renderThumb(magazinePdfUrl(m.id))])
        ).then((entries) => {
          if (!cancelled) setThumbs(Object.fromEntries(entries));
        });
      })
      .catch(() => { if (!cancelled) { setMagazines([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="magazines-page">
        <h2>Majalah Sebelumnya</h2>
        <div className="shelf-loading">
          {[1, 2, 3, 4].map((i) => <div key={i} className="shelf-loading-item" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="magazines-page">
      <h2>Majalah Sebelumnya</h2>
      {magazines.length === 0 ? (
        <p className="page-empty">Belum ada majalah.</p>
      ) : (
        <div className="magazines-shelf">
          {(() => {
            const rows = [];
            for (let i = 0; i < magazines.length; i += 4) {
              const chunk = magazines.slice(i, i + 4);
              rows.push(
                <div key={i} className="shelf-row">
                  {chunk.map((m) => (
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
              );
            }
            return rows;
          })()}
        </div>
      )}
    </div>
  );
}
