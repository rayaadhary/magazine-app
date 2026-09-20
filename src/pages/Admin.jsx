import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics, exportAnalyticsCsv } from "../api";
import { BarChart3, ShieldCheck, LogOut, Users, Eye, Activity, MessageCircle, Download, Menu, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const navItems = [
  { to: "/admin", label: "Ringkasan", icon: BarChart3, end: true },
  { to: "/admin/moderation", label: "Moderasi", icon: ShieldCheck, end: false },
];

function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success("Sesi redaksi ditutup");
    navigate("/login");
  };

  const sidebarContent = (
    <>
      <Link to="/admin" className="block mb-10" data-testid="admin-logo">
        <span className="font-heading text-3xl font-black text-white tracking-tight">SITTAH</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-gold mt-1">
          Ruang Redaksi
        </span>
      </Link>

      <div className="text-[10px] font-bold text-admin-secondary uppercase tracking-[0.15em] mb-3">
        Navigasi
      </div>
      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => {
          const active = end ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen?.(false)}
              className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-gold bg-white/10 text-gold"
                  : "border-transparent text-admin-secondary hover:text-white hover:bg-white/5"
              }`}
              data-testid={`admin-nav-${label.toLowerCase()}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 left-7 right-7 border-t border-admin-border pt-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center bg-gold text-xs font-bold text-navy">
            {(user?.label || user?.email || "A")[0].toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-white">{user?.label || user?.email}</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-admin-secondary">Admin aktif</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-admin-secondary hover:text-gold transition-colors bg-transparent border-none cursor-pointer font-body"
          data-testid="admin-logout"
        >
          <LogOut size={13} />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[250px] border-r border-admin-border bg-admin-bg px-7 py-8 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-[56px] items-center justify-between border-b border-admin-border bg-admin-bg px-4">
        <Link to="/admin" className="flex items-center gap-2" data-testid="admin-mobile-logo">
          <span className="font-heading text-xl font-black text-white tracking-tight">SITTAH</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold">Redaksi</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white bg-transparent border-none cursor-pointer p-1"
          aria-label="Menu"
          data-testid="admin-mobile-menu-toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <aside className="lg:hidden fixed inset-y-0 left-0 z-40 w-[250px] border-r border-admin-border bg-admin-bg px-7 py-8 pt-20" data-testid="admin-mobile-menu">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}

function AdminDashboard() {
  const [period, setPeriod] = useState("all");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["analytics", period],
    queryFn: () => getAnalytics(period),
  });

  const handleExportCsv = async () => {
    try {
      const blob = await exportAnalyticsCsv(period);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sittah-analytics.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh CSV");
    }
  };

  const statCards = [
    { label: "Pengunjung", value: stats?.total_visitors ?? "—", Icon: Users },
    { label: "Pembaca", value: stats?.total_reads ?? "—", Icon: Eye },
    { label: "Edisi Aktif", value: stats?.published_issues ?? "—", Icon: Activity },
    { label: "Moderasi", value: stats?.pending_comments ?? "—", Icon: MessageCircle },
  ];

  return (
    <section className="p-6 sm:p-10 lg:p-14 pt-[72px] lg:pt-10">
      <div className="flex flex-col justify-between gap-5 border-b border-admin-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Selamat datang kembali</div>
          <h1 className="mt-3 font-heading text-5xl tracking-tight">Ringkasan redaksi</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-admin-border bg-admin-bg px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-gold outline-none"
            data-testid="admin-period-select"
          >
            <option value="month">Bulan ini</option>
            <option value="three_months">3 bulan</option>
            <option value="semester">Semester</option>
            <option value="all">Semua waktu</option>
          </select>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 border border-gold/50 px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-navy"
            data-testid="admin-export-csv"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-admin-secondary">
        <span>Menampilkan: {stats?.period_label ?? "Semua waktu"}</span>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, Icon }) => (
          <div key={label} className="border border-admin-border bg-admin-surface p-5">
            <Icon size={17} className="text-gold" />
            <div className="mt-8 text-3xl font-light text-white">{value}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-admin-secondary">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-admin-border">
        <div className="flex items-center justify-between border-b border-admin-border px-5 py-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-admin-secondary">Performa edisi</div>
          <div className="text-[10px] text-gold">Live</div>
        </div>
        {isLoading ? (
          <div className="px-5 py-8 text-sm text-admin-secondary">Memuat data...</div>
        ) : !stats?.issues?.length ? (
          <div className="px-5 py-8 text-sm text-admin-secondary/50">Belum ada data</div>
        ) : (
          <div className="divide-y divide-admin-border">
            {stats.issues.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-5">
                <div>
                  <div className="text-sm text-white">{item.title}</div>
                  <div className="mt-1 text-[10px] text-admin-secondary">{item.comments} komentar</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{item.visits}</div>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-admin-secondary">kunjungan</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white">{item.reads}</div>
                  <div className="text-[9px] uppercase tracking-[0.1em] text-admin-secondary">baca</div>
                </div>
                <div className="h-1 w-16 bg-admin-border">
                  <div
                    className="h-full bg-gold"
                    style={{
                      width: `${Math.min(100, Math.max(8, (item.reads / Math.max(1, item.visits)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharts Bar Chart */}
      {stats?.issues?.length > 0 && (
        <div className="mt-8 border border-admin-border p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-admin-secondary mb-4">Grafik kunjungan</div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.issues}>
                <XAxis dataKey="title" tick={{ fill: "#A0A0A0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A0A0A0", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 0, color: "#FDFBF7" }}
                  itemStyle={{ color: "#FDFBF7" }}
                />
                <Bar dataKey="visits" fill="#C5A059" name="Kunjungan" />
                <Bar dataKey="reads" fill="#D4AF37" name="Baca" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <div className="min-h-screen bg-admin-bg text-admin-text" data-testid="admin-page">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="lg:pl-[250px]">
        <Outlet />
      </div>
    </div>
  );
}

export { AdminDashboard };
