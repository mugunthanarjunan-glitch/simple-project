import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft, Ticket } from "lucide-react";

export default function MyBookings() {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="results-container">
        <div className="results-header-card">
          <button onClick={() => navigate("/home")} className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="placeholder-card">
          <div className="placeholder-icon">
            <Ticket size={48} className="text-red" />
          </div>
          <h2>My Bookings</h2>
          <p className="placeholder-subtitle">
            You currently have no active bus reservations.
          </p>
          <p className="placeholder-note">
            Bookings created during seat selection and checkout modules will appear here.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="primary-button"
            style={{ maxWidth: "250px", margin: "20px auto 0" }}
          >
            Search & Book Buses
          </button>
        </div>
      </main>
    </div>
  );
}

