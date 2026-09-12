import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

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
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-brand flex items-center py-1" onClick={handleNav}>
          <img 
            src="/logo-sittah.png" 
            alt="Sittah Magazine" 
            className="h-12 sm:h-14 w-auto object-contain" // Ubah h-12 ke h-16 kalau masih kurang besar
            onError={(e) => { 
              e.target.style.display = 'none'; 
              e.target.nextSibling.style.display = 'block'; 
            }} 
          />
          <span style={{ display: 'none', fontWeight: 800, fontSize: '1.1rem' }}>Sittah Magazine</span>
        </Link>
      </div>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        {menuOpen ? "\u2715" : "\u2630"}
      </button>
      <nav className={`header-right${menuOpen ? " open" : ""}`}>
        <Link to="/magazines" onClick={handleNav}>Arsip Majalah</Link>
        {user ? (
          <>
            <Link to="/admin" onClick={handleNav}>Kelola</Link>
            <button onClick={handleLogout} className="btn-link">Keluar</button>
          </>
        ) : (
          <Link to="/login" onClick={handleNav}>Masuk</Link>
        )}
      </nav>
    </header>
  );
}
