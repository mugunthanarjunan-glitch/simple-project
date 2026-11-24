import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft, Bus, Calendar, CheckCircle2 } from "lucide-react";

export default function SeatSelectionPlaceholder() {
  const { busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bus = location.state?.bus;
  const journeyDate = location.state?.journeyDate;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="results-container">
        <div className="results-header-card">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Search Results</span>
          </button>
        </div>

        <div className="placeholder-card">
          <div className="placeholder-icon">
            <CheckCircle2 size={48} className="text-red" />
          </div>
          <h2>Ready for Seat Selection!</h2>
          <p className="placeholder-subtitle">
            You have selected Bus #{busId} for booking.
          </p>

          {bus && (
            <div className="selected-bus-summary">
              <div className="summary-row">
                <span className="summary-label">Bus Operator:</span>
                <span className="summary-value font-bold">{bus.busName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Bus Number:</span>
                <span className="summary-value">{bus.busNumber}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Bus Type:</span>
                <span className="summary-value">{bus.busType}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Route:</span>
                <span className="summary-value font-bold">
                  {bus.from} → {bus.to}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Departure / Arrival:</span>
                <span className="summary-value">
                  {bus.departureTime} → {bus.arrivalTime} ({bus.duration})
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Journey Date:</span>
                <span className="summary-value">{journeyDate || "N/A"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Fare:</span>
                <span className="summary-value text-red font-bold">
                  ₹{bus.price} per seat
                </span>
              </div>
            </div>
          )}

          <div className="placeholder-note">
            <p>
              <strong>Next Step (Module 3):</strong> Interactive Seat Selection & Passenger Layout.
            </p>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="primary-button"
            style={{ maxWidth: "250px", margin: "20px auto 0" }}
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}

