import { useEffect, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;
const RENDER_SCALE = 1;
const BATCH_SIZE = 3;
const PDF_LOAD_TIMEOUT = 15000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

function getFlipbookSize(firstPage, fullscreen, isMobile) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = firstPage.width / firstPage.height;

  if (isMobile) {
    const maxW = vw - 24;
    const maxH = vh * 0.55;
    let pageW = maxW;
    let pageH = pageW / aspect;
    if (pageH > maxH) {
      pageH = maxH;
      pageW = pageH * aspect;
    }
    return { pageWidth: Math.floor(pageW), pageHeight: Math.floor(pageH) };
  }

  const maxW = fullscreen ? vw * 0.92 : vw * 0.82;
  const maxH = fullscreen ? vh - 110 : vh * 0.65;
  let pageW = maxW / 2;
  let pageH = pageW / aspect;
  if (pageH > maxH) {
    pageH = maxH;
    pageW = pageH * aspect;
  }
  return { pageWidth: Math.floor(pageW), pageHeight: Math.floor(pageH) };
}

async function renderPage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  const data = canvas.toDataURL("image/jpeg", 0.6);
  canvas.width = 0;
  canvas.height = 0;
  return { width: viewport.width, height: viewport.height, data };
}

export default function FlipbookViewer({ pdfUrl }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ pageWidth: 300, pageHeight: 400 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const flipRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!pdfUrl) return;
    setLoading(true);
    setPages([]);
    setError(null);
    setCurrentPage(0);

    const loadPdf = async () => {
      const pdf = await withTimeout(pdfjsLib.getDocument(pdfUrl).promise, PDF_LOAD_TIMEOUT);
      pdfRef.current = pdf;
      const total = pdf.numPages;
      const all = new Array(total).fill(null);

      const firstBatch = Math.min(BATCH_SIZE, total);
      const firstPages = await Promise.all(
        Array.from({ length: firstBatch }, (_, i) => renderPage(pdf, i + 1))
      );
      for (let i = 0; i < firstBatch; i++) all[i] = firstPages[i];
      setPages([...all]);
      setLoading(false);

      for (let start = firstBatch; start < total; start += BATCH_SIZE) {
        if (pdfRef.current !== pdf) return;
        const end = Math.min(start + BATCH_SIZE, total);
        const batch = await Promise.all(
          Array.from({ length: end - start }, (_, i) => renderPage(pdf, start + i + 1))
        );
        for (let i = 0; i < batch.length; i++) all[start + i] = batch[i];
        setPages([...all]);
      }
    };
    loadPdf().catch((e) => {
      setError(e.message === "timeout" ? "Gagal memuat PDF. Periksa koneksi internet." : "Gagal memuat majalah.");
      setLoading(false);
    });

    return () => { pdfRef.current = null; };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pages.length) return;
    const ref = pages[0];
    if (!ref) return;
    const update = () => setSize(getFlipbookSize(ref, fullscreen, isMobile));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [pages, fullscreen, isMobile]);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [fullscreen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        flipRef.current?.pageFlip().flipNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        flipRef.current?.pageFlip().flipPrev();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
      } else if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
        setCurrentPage(0);
        setZoom(1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen]);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const zoomReset = () => setZoom(1);

  const goToPage = useCallback((i) => {
    flipRef.current?.pageFlip().flip(i);
  }, []);

  if (loading) return <div className="fb-loading">Memuat majalah...</div>;
  if (error) return <div className="fb-loading" style={{ color: "#c0392b" }}>{error}</div>;
  if (!pages.length) return <div className="fb-loading">Tidak ada halaman</div>;

  const totalRealPages = pages.length;

  const flipbook = (
    <HTMLFlipBook
      ref={flipRef}
      width={size.pageWidth}
      height={size.pageHeight}
      showCover={!isMobile}
      drawShadow={true}
      flippingTime={800}
      usePortrait={isMobile}
      startZIndex={0}
      onFlip={(e) => setCurrentPage(e.data)}
    >
      {pages.map((p, i) => (
        <div key={i} className="fb-page">
          {p ? (
            <img src={p.data} alt={`Halaman ${i + 1}`} draggable={false} />
          ) : (
            <div className="fb-page-placeholder" />
          )}
        </div>
      ))}
    </HTMLFlipBook>
  );

  const toolbar = (
    <div className={`fb-toolbar ${fullscreen ? "fb-toolbar-fs" : ""}`}>
      <div className="fb-toolbar-left">
        <button onClick={() => flipRef.current?.pageFlip().flipPrev()} disabled={currentPage <= 0} className="fb-btn" aria-label="Sebelumnya">
          ‹
        </button>
        <span className="fb-page-info">
          <input
            type="range"
            min={0}
            max={totalRealPages - 1}
            value={currentPage}
            onChange={(e) => goToPage(+e.target.value)}
            className="fb-slider"
          />
          <span className="fb-page-num">{currentPage + 1} / {totalRealPages}</span>
        </span>
        <button onClick={() => flipRef.current?.pageFlip().flipNext()} disabled={currentPage >= totalRealPages - 1} className="fb-btn" aria-label="Selanjutnya">
          ›
        </button>
      </div>

      <div className="fb-toolbar-right">
        <div className="fb-zoom-group">
          <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN} className="fb-btn" aria-label="Perkecil">−</button>
          <button onClick={zoomReset} className="fb-btn fb-zoom-label" aria-label="Reset zoom">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX} className="fb-btn" aria-label="Perbesar">+</button>
        </div>
        {fullscreen ? (
          <button onClick={() => { setFullscreen(false); setCurrentPage(0); setZoom(1); }} className="fb-btn fb-close-btn" aria-label="Tutup">
            ✕
          </button>
        ) : (
          <button onClick={() => { setFullscreen(true); setZoom(1); }} className="fb-btn" aria-label="Fullscreen">
            ⛶
          </button>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fb-fullscreen">
        <div className="fb-fullscreen-body">
          <div className="fb-zoom-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
            {flipbook}
          </div>
          {toolbar}
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="fb-container fb-container-mobile">
        {flipbook}
        {toolbar}
      </div>
    );
  }

  return (
    <div className="fb-container">
      <div className="fb-zoom-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
        {flipbook}
      </div>
      {toolbar}
    </div>
  );
}
