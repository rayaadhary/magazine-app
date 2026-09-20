import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMagazines, deleteMagazine, magazinePdfUrl } from "../api";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminIssues() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: magazines = [], isLoading } = useQuery({
    queryKey: ["magazines"],
    queryFn: getMagazines,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, pdfUrl }) => deleteMagazine(id, pdfUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["magazines"] });
      toast.success("Edisi berhasil dihapus");
    },
    onError: () => toast.error("Gagal menghapus edisi"),
  });

  const handleDelete = (magazine) => {
    if (!confirm(`Hapus "${magazine.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    deleteMutation.mutate({ id: magazine.id, pdfUrl: magazine.pdf_url });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <section className="p-6 sm:p-10 lg:p-14 pt-[72px] lg:pt-10" data-testid="admin-issues-page">
      <div className="flex flex-col justify-between gap-5 border-b border-admin-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Kelola konten</div>
          <h1 className="mt-3 font-heading text-5xl tracking-tight">Daftar Edisi</h1>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-gold-rich transition-colors"
          data-testid="admin-issues-add"
        >
          <Plus size={14} />
          Tambah Edisi
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 text-sm text-admin-secondary">Memuat data...</div>
      ) : magazines.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-admin-surface border border-admin-border">
            <BookOpen className="text-gold" size={24} />
          </div>
          <p className="mt-4 text-sm text-admin-secondary">Belum ada edisi.</p>
          <Link
            to="/admin/new"
            className="mt-4 text-xs text-gold hover:text-gold-rich transition-colors"
          >
            Tambah edisi pertama
          </Link>
        </div>
      ) : (
        <div className="mt-8 border border-admin-border">
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 border-b border-admin-border px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-admin-secondary">
            <span className="w-12">Sampul</span>
            <span>Judul</span>
            <span>Tanggal</span>
            <span>Status</span>
            <span className="w-24 text-right">Aksi</span>
          </div>

          <div className="divide-y divide-admin-border">
            {magazines.map((m) => (
              <div key={m.id} className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-admin-surface/50 transition-colors">
                <div className="w-12 h-16 bg-navy overflow-hidden shrink-0">
                  <img
                    src={magazinePdfUrl(m) ? `https://images.unsplash.com/photo-1741356474365-5f0041f89eaa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtYWdhemluZSUyMGNvdmVyJTIwYmxhY2slMjBnb2xkfGVufDB8fHx8MTc4ODE4NTU2NHww&ixlib=rb-4.1.0&q=85` : ""}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{m.title}</div>
                  <div className="mt-1 text-[10px] text-admin-secondary line-clamp-1">{m.description || "Tanpa deskripsi"}</div>
                </div>

                <div className="hidden sm:block text-[10px] text-admin-secondary whitespace-nowrap">
                  {formatDate(m.published_at)}
                </div>

                <div className="hidden sm:block">
                  <span className="text-[9px] uppercase tracking-[0.12em] text-gold bg-gold/10 px-2 py-1">
                    Terbit
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-end sm:w-24">
                  <button
                    onClick={() => navigate(`/admin/${m.id}/edit`)}
                    className="p-2 text-admin-secondary hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
                    title="Edit"
                    data-testid={`admin-issue-edit-${m.id}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="p-2 text-admin-secondary hover:text-danger transition-colors bg-transparent border-none cursor-pointer"
                    title="Hapus"
                    data-testid={`admin-issue-delete-${m.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
