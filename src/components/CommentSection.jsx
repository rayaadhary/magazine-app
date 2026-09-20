import { useEffect, useState } from "react";
import { getComments, addComment, deleteComment } from "../api";
import { useAuth } from "../AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CommentSection({ magazineId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", magazineId],
    queryFn: () => getComments(magazineId),
    enabled: !!magazineId,
  });

  const submitMutation = useMutation({
    mutationFn: () => addComment(magazineId, authorName.trim(), text.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", magazineId] });
      setText("");
      toast.success("Komentar dikirim");
    },
    onError: () => toast.error("Gagal mengirim komentar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", magazineId] });
      toast.success("Komentar dihapus");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) return;
    submitMutation.mutate();
  };

  return (
    <section className="border-t border-navy/10 pt-8" data-testid="comment-section">
      <h3 className="text-lg font-bold text-navy mb-5">Komentar</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-[600px] mb-8" data-testid="comment-form">
        <input
          type="text"
          placeholder="Nama Anda"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          className="px-4 py-2.5 border-b border-navy rounded-none text-sm font-body bg-transparent focus:outline-none focus:border-gold transition-colors"
          data-testid="comment-author-input"
        />
        <textarea
          placeholder="Tulis komentar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={3}
          className="px-4 py-2.5 border-b border-navy rounded-none text-sm font-body bg-transparent focus:outline-none focus:border-gold transition-colors resize-none"
          data-testid="comment-text-input"
        />
        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="self-start inline-flex items-center gap-2 px-6 py-2.5 bg-navy text-gold border-none rounded-none text-sm font-bold cursor-pointer hover:bg-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="comment-submit"
        >
          <Send size={14} />
          {submitMutation.isPending ? "Mengirim..." : "Kirim"}
        </button>
      </form>
      <div className="max-w-[600px]">
        {comments.length === 0 && (
          <p className="text-navy/60 text-sm">Belum ada komentar. Jadilah yang pertama!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="py-4 border-b border-navy/10">
            <div className="flex items-center gap-3 mb-1">
              <strong className="text-sm text-navy">{c.author_name}</strong>
              <span className="text-xs text-navy/60">
                {new Date(c.created_at).toLocaleDateString("id-ID")}
              </span>
              {user && (user.role === "pembina" || user.role === "waka") && (
                <button
                  onClick={() => {
                    if (!confirm("Hapus komentar ini?")) return;
                    deleteMutation.mutate(c.id);
                  }}
                  className="ml-auto text-danger/70 hover:text-danger bg-transparent border-none cursor-pointer transition-colors"
                  aria-label="Hapus"
                  data-testid={`comment-delete-${c.id}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-sm text-navy leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
