import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMagazine } from "../api";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
    if (file.size > 10 * 1024 * 1024) { setError("File terlalu besar, maksimal 10MB"); return; }
    setError("");
    setLoading(true);
    try {
      await createMagazine(title, description, file);
      toast.success("Edisi baru ditambahkan");
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    }
    setLoading(false);
  };

  return (
    <section className="p-6 sm:p-10 lg:p-14" data-testid="admin-new-page">
      <button
        onClick={() => navigate("/admin")}
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 hover:text-gold transition-colors mb-8 bg-transparent border-none cursor-pointer font-body"
        data-testid="admin-new-back"
      >
        <ArrowLeft size={15} />
        Kembali
      </button>

      <h1 className="font-heading text-4xl mb-8">Edisi Baru</h1>

      <form onSubmit={handleSubmit} className="max-w-[480px] space-y-6" data-testid="admin-new-form">
        {error && (
          <div className="bg-danger/15 text-danger px-4 py-2.5 rounded-md text-sm font-medium border border-danger/15" data-testid="admin-new-error">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
            Judul
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-transparent border border-admin-border rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-body"
            data-testid="admin-new-title"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
            Deskripsi (opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-transparent border border-admin-border rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold transition-colors font-body resize-none"
            data-testid="admin-new-description"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">
            File PDF
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full px-4 py-3 bg-transparent border border-dashed border-admin-border rounded-md text-sm text-white/60 file:mr-4 file:py-1 file:px-3 file:rounded file:border-none file:text-xs file:font-bold file:bg-gold file:text-navy file:cursor-pointer hover:file:bg-gold-rich transition-colors font-body"
            data-testid="admin-new-file"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gold text-navy text-sm font-bold rounded-md cursor-pointer hover:bg-gold-rich transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body border-none"
            data-testid="admin-new-submit"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="px-6 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-md cursor-pointer hover:bg-white/15 transition-colors font-body border-none"
            data-testid="admin-new-cancel"
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  );
}
