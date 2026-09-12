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
        <Link to="/" className="header-brand" onClick={handleNav}>
          <img src="/logo-sittah.png" alt="Sittah Magazine" className="header-logo" />
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
