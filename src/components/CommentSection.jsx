import { useEffect, useState } from "react";
import { getComments, addComment, deleteComment } from "../api";
import { useAuth } from "../AuthContext";

export default function CommentSection({ magazineId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!magazineId) return;
    getComments(magazineId).then(setComments).catch(() => {});
  }, [magazineId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) return;
    setSending(true);
    try {
      const c = await addComment(magazineId, authorName.trim(), text.trim());
      setComments((prev) => [...prev, c]);
      setText("");
    } catch {
      alert("Gagal mengirim komentar");
    }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus komentar ini?")) return;
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="comment-section">
      <h3>Komentar</h3>
      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Nama Anda"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
        />
        <textarea
          placeholder="Tulis komentar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={3}
        />
        <button type="submit" disabled={sending}>
          {sending ? "Mengirim..." : "Kirim Komentar"}
        </button>
      </form>
      <div className="comment-list">
        {comments.length === 0 && <p className="comment-empty">Belum ada komentar. Jadilah yang pertama!</p>}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <strong style={{ color: "#1a2a42", fontSize: "0.9rem" }}>{c.author_name}</strong>
              <span className="comment-date">{new Date(c.created_at).toLocaleDateString("id-ID")}</span>
              {user && (user.role === "pembina" || user.role === "waka") && (
                <button onClick={() => handleDelete(c.id)} className="btn-delete-sm">Hapus</button>
              )}
            </div>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
