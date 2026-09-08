import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMagazine, updateMagazine } from "../api";

export default function AdminEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMagazine(id)
      .then((m) => { setTitle(m.title); setDescription(m.description || ""); })
      .catch(() => setError("Majalah tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateMagazine(id, title, description, file);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    }
    setSaving(false);
  };

  if (loading) return <div className="page-loading">Memuat...</div>;

  return (
    <div className="admin-form-page">
      <h2>Edit Majalah</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="error-msg">{error}</div>}
        <label>Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Deskripsi (opsional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <label>Ganti PDF (opsional)</label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/admin")} className="btn-cancel">Batal</button>
        </div>
      </form>
    </div>
  );
}
