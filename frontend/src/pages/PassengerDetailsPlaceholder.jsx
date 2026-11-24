import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ArrowLeft, CheckCircle2, UserCheck, Ticket, Calendar, MapPin } from "lucide-react";

export default function PassengerDetailsPlaceholder() {
  const location = useLocation();
  const navigate = useNavigate();

  const bus = location.state?.bus;
  const journeyDate = location.state?.journeyDate;
  const selectedSeats = location.state?.selectedSeats || [];
  const totalAmount = location.state?.totalAmount || 0;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="results-container">
        <div className="results-header-card">
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={18} />
            <span>Back to Seat Selection</span>
          </button>
        </div>

        <div className="placeholder-card">
          <div className="placeholder-icon">
            <UserCheck size={52} className="text-red" />
          </div>
          <h2>Seats Validated Successfully!</h2>
          <p className="placeholder-subtitle">
            You are now ready to enter passenger details.
          </p>

          <div className="selected-bus-summary">
            {bus && (
              <>
                <div className="summary-row">
                  <span className="summary-label">Operator:</span>
                  <span className="summary-value font-bold">{bus.busName}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Route:</span>
                  <span className="summary-value font-bold">
                    {bus.from} → {bus.to}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Schedule:</span>
                  <span className="summary-value">
                    {bus.departureTime} → {bus.arrivalTime}
                  </span>
                </div>
              </>
            )}
            <div className="summary-row">
              <span className="summary-label">Journey Date:</span>
              <span className="summary-value font-bold">{journeyDate || "N/A"}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Confirmed Seats:</span>
              <span className="summary-value font-bold text-red">
                {selectedSeats.join(", ") || "None"} ({selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"})
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total Fare:</span>
              <span className="summary-value text-red font-bold" style={{ fontSize: "16px" }}>
                ₹{totalAmount}
              </span>
            </div>
          </div>

          <div className="placeholder-note">
            <p>
              <strong>Next Module (Module 4):</strong> Passenger Information Input, Contact Details & Final Booking Confirmation.
            </p>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="primary-button"
            style={{ maxWidth: "260px", margin: "24px auto 0" }}
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}

