import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMagazines, deleteMagazine } from "../api";
import { BarChart3, BookOpen, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { to: "/admin", label: "Ringkasan", icon: BarChart3, end: true },
  { to: "/admin/issues", label: "Arsip Edisi", icon: BookOpen, end: false },
];

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success("Sesi redaksi ditutup");
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[250px] border-r border-admin-border bg-admin-bg px-7 py-8 lg:block">
      <Link to="/admin" className="block mb-10">
        <span className="font-heading text-3xl font-black text-white">SITTAH</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gold mt-1">
          Ruang Redaksi
        </span>
      </Link>

      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => {
          const active = end ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 left-7 right-7">
        <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-3">
          {user?.label || user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors bg-transparent border-none cursor-pointer font-body"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </aside>
  );
}

function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: magazines = [], isLoading } = useQuery({
    queryKey: ["admin-magazines"],
    queryFn: getMagazines,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => deleteMagazine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-magazines"] });
      toast.success("Majalah dihapus");
    },
  });

  return (
    <section className="p-6 sm:p-10 lg:p-14">
      <div className="border-b border-admin-border pb-8">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Ringkasan</div>
        <h1 className="mt-3 font-heading text-5xl">Kelola Majalah</h1>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="border border-admin-border p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Total Edisi</div>
          <div className="mt-2 font-heading text-4xl text-white">{magazines.length}</div>
        </div>
        <div className="border border-admin-border p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Edisi Terbaru</div>
          <div className="mt-2 font-heading text-lg text-white">
            {magazines[0]?.title || "—"}
          </div>
        </div>
        <div className="border border-admin-border p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Status</div>
          <div className="mt-2 font-heading text-lg text-gold">Aktif</div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl text-white">Edisi Terbaru</h2>
          <Link
            to="/admin/new"
            className="px-4 py-2 bg-gold text-navy text-sm font-bold rounded-md hover:bg-gold-rich transition-colors"
          >
            + Edisi Baru
          </Link>
        </div>

        {isLoading ? (
          <p className="text-white/50 text-sm">Memuat...</p>
        ) : magazines.length === 0 ? (
          <p className="text-white/30 text-sm">Belum ada majalah.</p>
        ) : (
          <div className="border border-admin-border">
            <div className="grid grid-cols-[1fr_auto_auto] border-b border-admin-border px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
              <span>Judul</span>
              <span>Tanggal</span>
              <span>Aksi</span>
            </div>
            <div className="divide-y divide-admin-border">
              {magazines.map((m) => (
                <div key={m.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-6 px-6 py-5">
                  <span className="text-sm text-white font-medium">{m.title}</span>
                  <span className="text-xs text-white/40">
                    {new Date(m.published_at).toLocaleDateString("id-ID")}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/${m.id}/edit`}
                      className="px-3 py-1.5 text-xs font-semibold bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (!confirm(`Hapus "${m.title}"?`)) return;
                        deleteMutation.mutate({ id: m.id });
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-danger/20 text-danger rounded hover:bg-danger/30 transition-colors border-none cursor-pointer font-body"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || user.role === "siswa")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-admin-bg p-12 text-admin-text">
        Memuat ruang redaksi...
      </div>
    );
  }

  if (!user || user.role === "siswa") return null;

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text">
      <AdminSidebar />
      <div className="lg:pl-[250px]">
        <Outlet />
      </div>
    </div>
  );
}

export { AdminDashboard };
