import { uploadPdf, deletePdf } from "./utils/supabase";

const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res;
}

export async function login(email, password) {
  const res = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function logout() {
  await request("/auth/logout", { method: "POST" });
}

export async function getMe() {
  const res = await request("/auth/me");
  return res.json();
}

export async function getMagazines() {
  const res = await request("/magazines");
  return res.json();
}

export async function getLatestMagazine() {
  const res = await request("/magazines/latest");
  return res.json();
}

export async function getMagazine(id) {
  const res = await request(`/magazines/${id}`);
  return res.json();
}

export async function createMagazine(title, description, file, onProgress) {
  if (onProgress) onProgress({ phase: "upload", current: 0, total: 1 });
  const pdf_url = await uploadPdf(file, onProgress);
  const res = await request("/magazines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, pdf_url }),
  });
  return res.json();
}

export async function updateMagazine(id, title, description, file, onProgress) {
  const body = { title, description };
  if (file) {
    if (onProgress) onProgress({ phase: "upload", current: 0, total: 1 });
    body.pdf_url = await uploadPdf(file, onProgress);
  }
  const res = await request(`/magazines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteMagazine(id, pdfUrl) {
  if (pdfUrl) await deletePdf(pdfUrl);
  await request(`/magazines/${id}`, { method: "DELETE" });
}

export function magazinePdfUrl(magazine) {
  return magazine?.pdf_url || "";
}

export async function getComments(magazineId) {
  const res = await request(`/magazines/${magazineId}/comments`);
  return res.json();
}

export async function addComment(magazineId, authorName, text) {
  const res = await request(`/magazines/${magazineId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author_name: authorName, text }),
  });
  return res.json();
}

export async function deleteComment(commentId) {
  await request(`/comments/${commentId}`, { method: "DELETE" });
}
