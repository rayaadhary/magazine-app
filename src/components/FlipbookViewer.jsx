import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function getFlipbookSize(firstPage, fullscreen) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (fullscreen) {
    const maxH = vh - 80;
    const bookH = Math.min(firstPage.height, maxH);
    const bookW = (firstPage.width / firstPage.height) * bookH;
    return { halfWidth: Math.floor(bookW / 2), bookHeight: bookH };
  }
  const isMobile = vw < 640;
  const maxH = isMobile ? Math.min(vw - 24, 420) : 600;
  const bookH = Math.min(firstPage.height, maxH);
  const bookW = (firstPage.width / firstPage.height) * bookH;
  return { halfWidth: Math.floor(bookW / 2), bookHeight: bookH, isMobile };
}

export default function FlipbookViewer({ pdfUrl }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [size, setSize] = useState({ halfWidth: 300, bookHeight: 400, isMobile: false });
  const flipRef = useRef(null);

  useEffect(() => {
    if (!pdfUrl) return;
    setLoading(true);
    setPages([]);

    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const rendered = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
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
    const update = () => setSize(getFlipbookSize(pages[0], fullscreen));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [pages, fullscreen]);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [fullscreen]);

  if (loading) return <div className="flipbook-loading">Memuat majalah...</div>;
  if (!pages.length) return <div className="flipbook-loading">Tidak ada halaman</div>;

  const isMobile = size.isMobile;
  const coverSrc = pages[0]?.data;

  const flipbook = (
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
  );

  if (fullscreen) {
    return (
      <div className="flipbook-fullscreen">
        <button className="flipbook-fullscreen-close" onClick={() => { setFullscreen(false); setCurrentPage(0); }} aria-label="Tutup">✕</button>
        <div className="flipbook-fullscreen-body">
          {flipbook}
          <div className="flipbook-controls">
            <button onClick={() => flipRef.current?.pageFlip().flipPrev()} disabled={currentPage <= 0}>Sebelumnya</button>
            <span>Halaman {currentPage + 1} / {pages.length}</span>
            <button onClick={() => flipRef.current?.pageFlip().flipNext()} disabled={currentPage >= pages.length - 1}>Selanjutnya</button>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flipbook-container">
        <div className="flipbook-cover-preview">
          <img src={coverSrc} alt="Cover majalah" className="flipbook-cover-img" />
        </div>
        <button className="flipbook-open-btn" onClick={() => { setCurrentPage(0); setFullscreen(true); }}>
          Buka Majalah
        </button>
      </div>
    );
  }

  return (
    <div className="flipbook-container">
      {flipbook}
      <div className="flipbook-controls">
        <button onClick={() => flipRef.current?.pageFlip().flipPrev()} disabled={currentPage <= 0}>Sebelumnya</button>
        <span>Halaman {currentPage + 1} / {pages.length}</span>
        <button onClick={() => flipRef.current?.pageFlip().flipNext()} disabled={currentPage >= pages.length - 1}>Selanjutnya</button>
      </div>
    </div>
  );
}
