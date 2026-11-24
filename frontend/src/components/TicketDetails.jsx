import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Ticket,
  User,
  XCircle
} from "lucide-react";

export default function TicketDetails({
  booking,
  onCancelBooking,
  isCancelling = false
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!booking) return null;

  const isCancelled = booking.status === "cancelled";

  const handlePrint = () => {
    window.print();
  };

  const confirmCancel = () => {
    setShowConfirmModal(false);
    if (onCancelBooking) {
      onCancelBooking(booking.bookingId);
    }
  };

  return (
    <div className="ticket-container">
      {/* Printable Boarding Pass Card */}
      <div className="ticket-card" id="printable-ticket">
        {/* Ticket Header */}
        <div className="ticket-card-header">
          <div className="ticket-brand">
            <span className="brand-logo">red<span>Bus</span></span>
            <span className="ticket-type-label">E-TICKET / BOARDING PASS</span>
          </div>

          <div className="ticket-id-status">
            <div className="ticket-id-box">
              <span className="ticket-id-label">BOOKING ID</span>
              <span className="ticket-id-value">{booking.bookingId}</span>
            </div>
            <div
              className={`status-pill ${
                isCancelled ? "status-cancelled" : "status-confirmed"
              }`}
            >
              {isCancelled ? (
                <>
                  <XCircle size={15} />
                  <span>Cancelled</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Confirmed</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bus and Journey Schedule Banner */}
        <div className="ticket-journey-banner">
          <div className="journey-left">
            <h3 className="ticket-bus-name">{booking.busName}</h3>
            <span className="bus-number-badge">{booking.busNumber}</span>
          </div>

          <div className="journey-route-display">
            <div className="journey-station">
              <span className="station-city">{booking.from}</span>
              <span className="station-time">{booking.departureTime || "Dep: Scheduled"}</span>
            </div>

            <div className="journey-connector">
              <span className="connector-date">
                <Calendar size={13} className="inline-icon" /> {booking.journeyDate}
              </span>
              <div className="connector-arrow">──────▶</div>
            </div>

            <div className="journey-station text-right">
              <span className="station-city">{booking.to}</span>
              <span className="station-time">{booking.arrivalTime || "Arr: Scheduled"}</span>
            </div>
          </div>
        </div>

        {/* Passengers Table */}
        <div className="ticket-section">
          <h4 className="ticket-section-title">
            <User size={16} className="text-red" />
            Passenger Information
          </h4>
          <div className="ticket-table-wrapper">
            <table className="ticket-passengers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Seat No.</th>
                  <th>Passenger Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                {booking.passengers?.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>
                      <span className="seat-badge-pill">{p.seatNumber}</span>
                    </td>
                    <td className="font-bold">{p.name}</td>
                    <td>{p.age} yrs</td>
                    <td>{p.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact & Fare Grid */}
        <div className="ticket-meta-grid">
          <div className="ticket-meta-box">
            <h5 className="meta-box-title">Contact Details</h5>
            <div className="contact-detail-row">
              <Mail size={14} className="text-muted" />
              <span>{booking.contactEmail}</span>
            </div>
            <div className="contact-detail-row">
              <Phone size={14} className="text-muted" />
              <span>+91 {booking.contactMobile}</span>
            </div>
          </div>

          <div className="ticket-meta-box">
            <h5 className="meta-box-title">Payment & Fare Details</h5>
            <div className="fare-detail-row">
              <span>Fare ({booking.selectedSeats?.length} seats × ₹{booking.ticketPrice}):</span>
              <span>₹{booking.totalAmount}</span>
            </div>
            <div className="fare-detail-row total-highlight">
              <span>Total Paid:</span>
              <span className="total-price font-bold text-red">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Ticket Footer Notes */}
        <div className="ticket-footer-notes">
          <p>
            • Please arrive at the boarding point 15 minutes prior to scheduled departure.
          </p>
          <p>
            • Carry a valid government photo ID along with this digital or printed e-ticket.
          </p>
          <p>• Verified RedBus Academic Partner Ticket System.</p>
        </div>
      </div>

      {/* Ticket Action Buttons (Hidden when printing) */}
      <div className="ticket-action-buttons no-print">
        <button onClick={handlePrint} className="primary-button print-ticket-btn">
          <Printer size={17} />
          <span>Print / Download Ticket</span>
        </button>

        {!isCancelled && onCancelBooking && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isCancelling}
            className="cancel-booking-btn"
          >
            <XCircle size={17} />
            <span>{isCancelling ? "Cancelling..." : "Cancel Booking"}</span>
          </button>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay no-print">
          <div className="modal-card">
            <div className="modal-icon-warning">
              <AlertTriangle size={36} className="text-red" />
            </div>
            <h3 className="modal-title">Cancel Ticket Booking?</h3>
            <p className="modal-description">
              Are you sure you want to cancel booking <strong>{booking.bookingId}</strong> for{" "}
              <strong>{booking.from} → {booking.to}</strong>?
            </p>
            <p className="modal-sub-note">
              This will release your reserved seats (
              <strong>{booking.selectedSeats?.join(", ")}</strong>) immediately.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="modal-secondary-btn"
              >
                No, Keep Ticket
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="modal-danger-btn"
              >
                Yes, Cancel Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

