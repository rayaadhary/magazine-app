import { useEffect, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;
const RENDER_SCALE = 1;
const BATCH_SIZE = 3;

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
  const [showCover, setShowCover] = useState(true);
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
    setShowCover(true);

    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
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
    loadPdf().catch(() => setLoading(false));

    return () => { pdfRef.current = null; };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pages.length) return;
    const ref = showCover ? pages[0] : pages[0];
    if (!ref) return;
    const update = () => setSize(getFlipbookSize(ref, fullscreen, isMobile));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [pages, fullscreen, isMobile, showCover]);

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
        if (showCover) { openFlipbook(); return; }
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
        setShowCover(true);
        setCurrentPage(0);
        setZoom(1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreen, showCover]);

  // Mobile: skip cover
  useEffect(() => {
    if (isMobile && pages.length) setShowCover(false);
  }, [isMobile, pages.length]);

  const openFlipbook = useCallback(() => {
    setShowCover(false);
    setCurrentPage(0);
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const zoomReset = () => setZoom(1);

  const goToPage = useCallback((i) => {
    flipRef.current?.pageFlip().flip(i);
  }, []);

  if (loading) return <div className="fb-loading">Memuat majalah...</div>;
  if (!pages.length) return <div className="fb-loading">Tidak ada halaman</div>;

  // Cover pages: index 0 only, flipbook pages: index 1+
  const coverData = pages[0]?.data;
  const flipbookPages = showCover ? pages.slice(1) : pages;

  const flipbook = (
    <HTMLFlipBook
      ref={flipRef}
      width={size.pageWidth}
      height={size.pageHeight}
      drawShadow={true}
      flippingTime={800}
      usePortrait={isMobile}
      startZIndex={0}
      onFlip={(e) => setCurrentPage(e.data)}
    >
      {flipbookPages.map((p, i) => (
        <div key={showCover ? i + 1 : i} className="fb-page">
          {p ? (
            <img src={p.data} alt={`Halaman ${showCover ? i + 2 : i + 1}`} draggable={false} />
          ) : (
            <div className="fb-page-placeholder" />
          )}
        </div>
      ))}
    </HTMLFlipBook>
  );

  const totalRealPages = pages.length;
  const displayPage = showCover ? 1 : (currentPage + 2);

  const toolbar = (
    <div className={`fb-toolbar ${fullscreen ? "fb-toolbar-fs" : ""}`}>
      <div className="fb-toolbar-left">
        <button onClick={() => flipRef.current?.pageFlip().flipPrev()} disabled={currentPage <= 0 && !showCover} className="fb-btn" aria-label="Sebelumnya">
          ‹
        </button>
        <span className="fb-page-info">
          <input
            type="range"
            min={0}
            max={totalRealPages - 1}
            value={showCover ? 0 : currentPage + 1}
            onChange={(e) => {
              const v = +e.target.value;
              if (v === 0) { setShowCover(true); setCurrentPage(0); }
              else { setShowCover(false); goToPage(v - 1); }
            }}
            className="fb-slider"
          />
          <span className="fb-page-num">{displayPage} / {totalRealPages}</span>
        </span>
        <button onClick={() => { if (showCover) openFlipbook(); else flipRef.current?.pageFlip().flipNext(); }} disabled={!showCover && currentPage >= flipbookPages.length - 1} className="fb-btn" aria-label="Selanjutnya">
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
          <button onClick={() => { setFullscreen(false); setShowCover(true); setCurrentPage(0); setZoom(1); }} className="fb-btn fb-close-btn" aria-label="Tutup">
            ✕
          </button>
        ) : (
          <button onClick={() => { setFullscreen(true); setShowCover(false); setZoom(1); }} className="fb-btn" aria-label="Fullscreen">
            ⛶
          </button>
        )}
      </div>
    </div>
  );

  // Cover view (desktop only)
  if (showCover && coverData) {
    const cover = (
      <div className="fb-cover" onClick={openFlipbook}>
        <img src={coverData} alt="Cover majalah" className="fb-cover-img" draggable={false} />
        <div className="fb-cover-hint">Klik untuk membuka</div>
      </div>
    );

    if (fullscreen) {
      return (
        <div className="fb-fullscreen">
          <div className="fb-fullscreen-body">
            {cover}
            {toolbar}
          </div>
        </div>
      );
    }

    return (
      <div className="fb-container">
        {cover}
        {toolbar}
      </div>
    );
  }

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
