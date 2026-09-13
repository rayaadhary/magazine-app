import { pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";

const MAX_SIZE = 4 * 1024 * 1024;
const JPEG_QUALITY = 0.75;
const INITIAL_SCALE = 0.55;

async function renderPageToJpeg(pdf, pageNum, scale, quality) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  const data = canvas.toDataURL("image/jpeg", quality);
  canvas.width = 0;
  canvas.height = 0;
  return data;
}

async function buildPdf(pageImages) {
  const pdfDoc = await PDFDocument.create();
  for (const imgData of pageImages) {
    const imgBytes = await fetch(imgData).then((r) => r.arrayBuffer());
    const img = await pdfDoc.embedJpg(imgBytes);
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return pdfDoc.save();
}

async function compressWithScale(file, scale, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const images = [];

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress({ phase: "render", current: i, total });
    images.push(await renderPageToJpeg(pdf, i, scale, JPEG_QUALITY));
  }

  if (onProgress) onProgress({ phase: "build", current: total, total });
  const bytes = await buildPdf(images);
  return new Blob([bytes], { type: "application/pdf" });
}

export async function compressPdf(file, onProgress) {
  if (file.size <= MAX_SIZE) return file;

  let scale = INITIAL_SCALE;
  let blob = await compressWithScale(file, scale, onProgress);

  while (blob.size > MAX_SIZE && scale > 0.3) {
    scale -= 0.05;
    blob = await compressWithScale(file, scale, onProgress);
  }

  if (blob.size > MAX_SIZE) {
    throw new Error("File terlalu besar setelah kompresi. Coba kompres manual dulu.");
  }

  return new File([blob], file.name, { type: "application/pdf" });
}
