import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getMagazines, deleteMagazine } from "../api";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [magazines, setMagazines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role === "siswa")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && user.role !== "siswa") {
      getMagazines()
        .then(setMagazines)
        .catch(() => setMagazines([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Hapus majalah "${title}"?`)) return;
    await deleteMagazine(id);
    setMagazines((prev) => prev.filter((m) => m.id !== id));
  };

  if (authLoading || loading) return <div className="page-loading">Memuat...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Kelola Majalah</h2>
        <Link to="/admin/new" className="btn-primary">+ Majalah Baru</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Judul</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {magazines.map((m) => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td>{new Date(m.published_at).toLocaleDateString("id-ID")}</td>
              <td className="admin-actions">
                <Link to={`/admin/${m.id}/edit`} className="btn-edit">Edit</Link>
                <button onClick={() => handleDelete(m.id, m.title)} className="btn-delete">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {magazines.length === 0 && <p className="page-empty">Belum ada majalah.</p>}
    </div>
  );
}
