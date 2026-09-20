import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Menu, X, LogOut } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  const handleNav = () => setMenuOpen(false);

  return (
    <header className="flex h-[72px] items-center justify-center bg-navy px-5 text-white">
      <div className="flex w-full max-w-[1380px] items-center justify-between">
        <Link to="/" className="text-center" onClick={handleNav}>
          <div className="font-heading text-2xl sm:text-3xl font-black tracking-tight">
            SITTAH MAGAZINE
          </div>
          <div className="mt-1 text-[6px] sm:text-[7px] font-semibold uppercase tracking-[0.18em] text-gold">
            Humas SMP Muhammadiyah 6 Surabaya
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/archive" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-gold transition-colors">
            Arsip
          </Link>
          {user ? (
            <>
              <Link to="/admin" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-gold transition-colors">
                Kelola
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-gold transition-colors bg-transparent border-none cursor-pointer font-body">
                <LogOut size={13} />
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 hover:text-gold transition-colors">
              Masuk
            </Link>
          )}
        </nav>

        <button
          className="sm:hidden bg-transparent border-none text-white cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="absolute top-[72px] left-0 right-0 bg-navy border-t border-white/10 px-5 py-4 flex flex-col gap-3 sm:hidden z-50">
          <Link to="/archive" onClick={handleNav} className="text-sm font-medium text-white/80 hover:text-gold transition-colors">Arsip</Link>
          {user ? (
            <>
              <Link to="/admin" onClick={handleNav} className="text-sm font-medium text-white/80 hover:text-gold transition-colors">Kelola</Link>
              <button onClick={handleLogout} className="text-left text-sm font-medium text-white/80 hover:text-gold transition-colors bg-transparent border-none cursor-pointer font-body">Keluar</button>
            </>
          ) : (
            <Link to="/login" onClick={handleNav} className="text-sm font-medium text-white/80 hover:text-gold transition-colors">Masuk</Link>
          )}
        </nav>
      )}
    </header>
  );
}
