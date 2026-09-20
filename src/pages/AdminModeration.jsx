import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { getAllComments, moderateComment } from "../api";
import { toast } from "sonner";

export default function AdminModeration() {
  const client = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: getAllComments,
  });

  const moderate = useMutation({
    mutationFn: ({ id, status }) => moderateComment(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Status komentar diperbarui");
    },
    onError: () => toast.error("Gagal memperbarui komentar"),
  });

  return (
    <section className="p-6 sm:p-10 lg:p-14 pt-[72px] lg:pt-10" data-testid="admin-moderation-page">
      <div className="border-b border-admin-border pb-8">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Menjaga percakapan</div>
        <h1 className="mt-3 font-heading text-5xl tracking-tight">Moderasi komentar</h1>
      </div>

      <div className="mt-8 border border-admin-border">
        <div className="grid grid-cols-[1fr_auto] border-b border-admin-border px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-admin-secondary">
          <span>Komentar pembaca</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div className="px-6 py-8 text-sm text-admin-secondary">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="px-6 py-8 text-sm text-admin-secondary/50">Belum ada komentar</div>
        ) : (
          <div className="divide-y divide-admin-border">
            {comments.map((comment) => (
              <article key={comment.id} className="grid gap-5 px-6 py-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">{comment.author_name}</span>
                    <span className="text-[9px] uppercase tracking-[0.12em] text-admin-secondary">
                      {comment.magazine_title || comment.magazine_id}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[650px] text-sm leading-6 text-admin-secondary">{comment.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    moderate.mutate({
                      id: comment.id,
                      status: comment.status === "visible" ? "hidden" : "visible",
                    })
                  }
                  className={`flex h-fit items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    comment.status === "visible"
                      ? "border-gold/50 text-gold hover:bg-gold hover:text-navy"
                      : "border-danger text-danger/70 hover:bg-danger hover:text-white"
                  }`}
                  data-testid={`moderate-toggle-${comment.id}`}
                >
                  {comment.status === "visible" ? (
                    <>
                      <EyeOff size={13} /> Sembunyikan
                    </>
                  ) : (
                    <>
                      <Eye size={13} /> Tampilkan
                    </>
                  )}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
