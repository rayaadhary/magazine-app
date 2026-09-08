import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-brand">
          Media internal SMP MUHAMMADIYAH 6 SURABAYA.
        </Link>
      </div>
      <nav className="header-right">
        <Link to="/magazines">Majalah Sebelumnya</Link>
        {user ? (
          <>
            <Link to="/admin">Admin</Link>
            <button onClick={handleLogout} className="btn-link">Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
