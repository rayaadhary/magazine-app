import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMagazine } from "../api";

export default function AdminNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Pilih file PDF"); return; }
    setError("");
    setLoading(true);
    try {
      await createMagazine(title, description, file);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    }
    setLoading(false);
  };

  return (
    <div className="admin-form-page">
      <h2>Majalah Baru</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="error-msg">{error}</div>}
        <label>Judul</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Deskripsi (opsional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <label>File PDF</label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => navigate("/admin")} className="btn-cancel">Batal</button>
        </div>
      </form>
    </div>
  );
}
