import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, LogIn, LogOut, QrCode, Ticket } from "lucide-react";
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
  const isConductorActive = location.pathname.startsWith("/conductor");

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
          <Link
            to="/conductor/verify"
            className={`nav-link conductor-nav-link ${isConductorActive ? "active" : ""}`}
            title="Conductor Verification Portal"
          >
            <QrCode size={16} />
            <span>Conductor Portal</span>
          </Link>
        </div>
      </div>

      <div className="navbar-actions">
        {user?.name ? (
          <>
            <span className="navbar-greeting">
              Hi, <strong>{user.name}</strong>
            </span>
            <button
              className="logout-button"
              onClick={handleLogout}
              title="Sign out of your account"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <button
            className="primary-button"
            style={{ height: "36px", padding: "0 16px", marginTop: 0 }}
            onClick={() => navigate("/login")}
          >
            <LogIn size={15} style={{ marginRight: "6px" }} />
            <span>Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}
