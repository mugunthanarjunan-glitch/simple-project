import { Calendar, CheckCircle2, Clock, MapPin, ShieldCheck, Tag } from "lucide-react";

export default function BookingSummary({
  bus,
  journeyDate,
  selectedSeats = [],
  onConfirmBooking,
  loading = false,
  apiError = ""
}) {
  const seatCount = selectedSeats.length;
  const ticketPrice = bus?.price || 0;
  const totalAmount = seatCount * ticketPrice;

  return (
    <div className="booking-summary-card">
      <h3 className="booking-summary-title">Journey & Fare Summary</h3>

      {apiError && (
        <div className="error-box summary-error-box">
          <p>{apiError}</p>
        </div>
      )}

      {/* Bus and Route Info */}
      <div className="summary-bus-header">
        <div className="summary-bus-name-row">
          <h4 className="summary-bus-name">{bus?.busName || "Bus Operator"}</h4>
          <span className="bus-number-badge">{bus?.busNumber || "TN-BUS"}</span>
        </div>
        <span className="bus-type-badge badge-ac">{bus?.busType || "AC Sleeper"}</span>
      </div>

      <div className="summary-route-box">
        <div className="summary-route-line">
          <div className="summary-city-group">
            <span className="summary-city-name">{bus?.from}</span>
            <span className="summary-time">{bus?.departureTime}</span>
          </div>

          <div className="summary-arrow-block">
            <span className="summary-duration-tag">{bus?.duration}</span>
            <span className="route-arrow">→</span>
          </div>

          <div className="summary-city-group text-right">
            <span className="summary-city-name">{bus?.to}</span>
            <span className="summary-time">{bus?.arrivalTime}</span>
          </div>
        </div>

        <div className="summary-date-line">
          <Calendar size={14} className="text-red" />
          <span>Journey Date: <strong>{journeyDate || "N/A"}</strong></span>
        </div>
      </div>

      {/* Selected Seats info */}
      <div className="summary-seats-row">
        <div className="summary-meta-item">
          <span className="summary-meta-label">Selected Seats ({seatCount})</span>
          <div className="seats-badge-wrap">
            {selectedSeats.map((seat) => (
              <span key={`summary-${seat}`} className="seat-badge-pill">
                {seat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="summary-divider"></div>

      {/* Fare Calculation */}
      <div className="fare-breakdown">
        <div className="fare-row">
          <span>Ticket Price per Seat:</span>
          <span>₹{ticketPrice}</span>
        </div>
        <div className="fare-row">
          <span>Number of Passengers:</span>
          <span>× {seatCount}</span>
        </div>
        <div className="fare-divider"></div>
        <div className="fare-row total-fare-row">
          <span className="total-label">Total Amount:</span>
          <span className="total-fare-value">₹{totalAmount}</span>
        </div>
      </div>

      {/* Confirm Booking CTA */}
      <button
        type="button"
        className="primary-button confirm-booking-btn"
        onClick={onConfirmBooking}
        disabled={loading || seatCount === 0}
      >
        <CheckCircle2 size={18} />
        <span>{loading ? "Processing Booking..." : "Confirm & Book Seats"}</span>
      </button>

      <div className="summary-trust-footer">
        <ShieldCheck size={16} className="text-muted" />
        <span>Guaranteed Seat Reservation & Instant Confirmation</span>
      </div>
    </div>
  );
}

