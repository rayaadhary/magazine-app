const API_BASE = import.meta.env.VITE_API_URL || "/api";

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

export async function createMagazine(title, description, file) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  form.append("file", file);
  const res = await request("/magazines", { method: "POST", body: form });
  return res.json();
}

export async function updateMagazine(id, title, description, file) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  if (file) form.append("file", file);
  const res = await request(`/magazines/${id}`, { method: "PUT", body: form });
  return res.json();
}

export async function deleteMagazine(id) {
  await request(`/magazines/${id}`, { method: "DELETE" });
}

export function magazinePdfUrl(id) {
  const base = import.meta.env.VITE_API_URL || "";
  return `${base}/api/magazines/${id}/pdf`;
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
