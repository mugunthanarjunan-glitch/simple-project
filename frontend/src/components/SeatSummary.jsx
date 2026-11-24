import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Info, ShieldCheck } from "lucide-react";
import { validateSelectedSeats } from "../services/api";

export default function SeatSummary({
  bus,
  journeyDate,
  selectedSeats = [],
  onValidationError
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const seatCount = selectedSeats.length;
  const ticketPrice = bus?.price || 0;
  const totalAmount = seatCount * ticketPrice;

  const handleContinue = async () => {
    if (seatCount === 0) return;

    setLoading(true);
    setErrorMessage("");
    if (onValidationError) onValidationError("");

    try {
      // Validate selected seats with the backend before continuing
      const response = await validateSelectedSeats(bus.id, journeyDate, selectedSeats);

      // On successful validation, navigate to passenger details
      navigate("/passenger-details", {
        state: {
          bus,
          journeyDate,
          selectedSeats: response.selectedSeats || selectedSeats,
          totalAmount: response.totalAmount || totalAmount
        }
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to validate selected seats. Please re-check availability and try again.";
      setErrorMessage(msg);
      if (onValidationError) onValidationError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seat-summary-card">
      <h3 className="summary-card-title">Fare & Booking Summary</h3>

      {errorMessage && (
        <div className="error-box summary-error-box">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="summary-info-rows">
        <div className="summary-info-row">
          <span className="summary-row-label">Ticket Price:</span>
          <span className="summary-row-val font-bold">₹{ticketPrice} / seat</span>
        </div>

        <div className="summary-info-row">
          <span className="summary-row-label">Selected Seats:</span>
          <span className="summary-row-val">
            {seatCount > 0 ? (
              <span className="selected-seats-badge">
                {selectedSeats.join(", ")}
              </span>
            ) : (
              <span className="text-muted">None selected</span>
            )}
          </span>
        </div>

        <div className="summary-info-row">
          <span className="summary-row-label">Number of Seats:</span>
          <span className="summary-row-val font-bold">{seatCount}</span>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-info-row total-row">
          <span className="total-label">Total Amount:</span>
          <span className="total-value">₹{totalAmount}</span>
        </div>
      </div>

      <div className="selection-tip">
        <Info size={15} className="tip-icon" />
        <span>You can select up to 6 seats per booking transaction.</span>
      </div>

      <button
        type="button"
        className="primary-button continue-booking-btn"
        onClick={handleContinue}
        disabled={seatCount === 0 || loading}
      >
        <span>{loading ? "Validating Seats..." : "Continue to Passenger Details"}</span>
        <ArrowRight size={18} />
      </button>

      <div className="secure-badge">
        <ShieldCheck size={16} className="text-muted" />
        <span>Safe & Secure Seat Reservation</span>
      </div>
    </div>
  );
}

