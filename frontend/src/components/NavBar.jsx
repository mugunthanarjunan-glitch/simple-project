import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, LogOut, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      alert("Unable to logout. Please try again.");
    }
  };

  const isHomeActive = location.pathname === "/home" || location.pathname === "/";
  const isBookingsActive = location.pathname === "/my-bookings";

  return (
    <nav className="navbar">
      <div className="navbar-brand-section">
        <button
          className="brand"
          onClick={() => navigate("/home")}
          aria-label="RedBus Home"
        >
          red<span>Bus</span>
        </button>

        <div className="navbar-links">
          <Link
            to="/home"
            className={`nav-link ${isHomeActive ? "active" : ""}`}
          >
            <HomeIcon size={16} />
            <span>Home</span>
          </Link>
          <Link
            to="/my-bookings"
            className={`nav-link ${isBookingsActive ? "active" : ""}`}
          >
            <Ticket size={16} />
            <span>My Bookings</span>
          </Link>
        </div>
      </div>

      <div className="navbar-actions">
        {user?.name && (
          <span className="navbar-greeting">
            Hi, <strong>{user.name}</strong>
          </span>
        )}
        <button
          className="logout-button"
          onClick={handleLogout}
          title="Sign out of your account"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
