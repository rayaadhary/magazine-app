import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function getFlipbookSize(firstPage) {
  const vw = window.innerWidth;
  const isMobile = vw < 640;
  const maxHeight = isMobile ? Math.min(vw - 24, 500) : 600;
  const bookHeight = Math.min(firstPage.height, maxHeight);
  const bookWidth = (firstPage.width / firstPage.height) * bookHeight;
  const halfWidth = Math.floor(bookWidth / 2);
  return { halfWidth, bookHeight, isMobile };
}

export default function FlipbookViewer({ pdfUrl }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState({ halfWidth: 300, bookHeight: 400, isMobile: false });
  const flipRef = useRef(null);

  useEffect(() => {
    if (!pdfUrl) return;
    setLoading(true);
    setPages([]);

    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const totalPages = pdf.numPages;
      const rendered = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        rendered.push({
          width: viewport.width,
          height: viewport.height,
          data: canvas.toDataURL("image/jpeg", 0.8),
        });
      }

      setPages(rendered);
      setLoading(false);
    };

    loadPdf().catch(() => setLoading(false));
  }, [pdfUrl]);

  useEffect(() => {
    if (!pages.length) return;
    const update = () => setSize(getFlipbookSize(pages[0]));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [pages]);

  if (loading) return <div className="flipbook-loading">Memuat majalah...</div>;
  if (!pages.length) return <div className="flipbook-loading">Tidak ada halaman</div>;

  return (
    <div className="flipbook-container">
      <HTMLFlipBook
        ref={flipRef}
        width={size.halfWidth}
        height={size.bookHeight}
        showCover={true}
        drawShadow={true}
        flippingTime={800}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
        onFlip={(e) => setCurrentPage(e.data)}
      >
        {pages.map((p, i) => (
          <div key={i} className="flipbook-page">
            <img src={p.data} alt={`Halaman ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        ))}
      </HTMLFlipBook>
      <div className="flipbook-controls">
        <button onClick={() => flipRef.current?.pageFlip().flipPrev()} disabled={currentPage <= 0}>Sebelumnya</button>
        <span>Halaman {currentPage + 1} / {pages.length}</span>
        <button onClick={() => flipRef.current?.pageFlip().flipNext()} disabled={currentPage >= pages.length - 1}>Selanjutnya</button>
      </div>
    </div>
  );
}
