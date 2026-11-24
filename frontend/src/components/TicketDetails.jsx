import { useEffect, useState } from "react";
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
  QrCode,
  ShieldCheck,
  Ticket as TicketIcon,
  User,
  XCircle
} from "lucide-react";
import QRCode from "../utils/qrcode";
import { getTicketsByBooking } from "../services/api";

export default function TicketDetails({
  booking,
  initialTickets = [],
  onCancelBooking,
  isCancelling = false
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tickets, setTickets] = useState(initialTickets);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const isCancelled = booking?.status === "cancelled";

  // Fetch or generate passenger QR tickets
  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      if (!booking) return;

      // If initialTickets were provided with QR codes, use them
      if (initialTickets && initialTickets.length > 0) {
        setTickets(initialTickets);
        return;
      }

      setLoadingTickets(true);
      try {
        const response = await getTicketsByBooking(booking.bookingId);
        if (isMounted && response.tickets && response.tickets.length > 0) {
          setTickets(response.tickets);
          return;
        }
      } catch (err) {
        // Fallback: generate QR codes for each passenger from booking details
      }

      // Generate local QR codes if backend query didn't return them
      if (booking.passengers) {
        const generated = await Promise.all(
          booking.passengers.map(async (p, idx) => {
            const ticketId =
              p.ticketId ||
              `RBUS-TKT-${booking.bookingId.replace("RB-", "")}-${p.seatNumber}-${idx + 1}`;
            const qrPayload = JSON.stringify({ ticketId });
            const qrCode = await QRCode.toDataURL(qrPayload);

            return {
              ticketId,
              passengerName: p.name,
              passengerAge: p.age,
              passengerGender: p.gender,
              seatNumber: p.seatNumber,
              status: booking.status || "confirmed",
              verificationStatus: "not_checked",
              qrCode
            };
          })
        );

        if (isMounted) {
          setTickets(generated);
        }
      }

      if (isMounted) {
        setLoadingTickets(false);
      }
    };

    loadTickets();

    return () => {
      isMounted = false;
    };
  }, [booking, initialTickets]);

  if (!booking) return null;

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
              <span className="station-time">{booking.departureTime || "21:00"}</span>
            </div>

            <div className="journey-connector">
              <span className="connector-date">
                <Calendar size={13} className="inline-icon" /> {booking.journeyDate}
              </span>
              <div className="connector-arrow">──────▶</div>
            </div>

            <div className="journey-station text-right">
              <span className="station-city">{booking.to}</span>
              <span className="station-time">{booking.arrivalTime || "05:00"}</span>
            </div>
          </div>
        </div>

        {/* Passenger QR Boarding Passes Section (Module 5) */}
        <div className="ticket-section qr-tickets-section">
          <h4 className="ticket-section-title">
            <QrCode size={17} className="text-red" />
            <span>Passenger QR E-Tickets (Boarding Passes)</span>
          </h4>
          <p className="qr-section-note">
            Each passenger has a dedicated verification QR code. Present this code to the bus conductor for seamless boarding.
          </p>

          <div className="qr-tickets-grid">
            {tickets.map((t, idx) => {
              const isCheckedIn = t.verificationStatus === "checked_in";
              return (
                <div key={t.ticketId || `ticket-${idx}`} className="passenger-qr-card">
                  <div className="qr-card-header">
                    <div className="qr-passenger-info">
                      <span className="qr-seat-badge">Seat {t.seatNumber}</span>
                      <h5 className="qr-passenger-name">{t.passengerName}</h5>
                      <span className="qr-meta-text">
                        {t.passengerAge} yrs • {t.passengerGender}
                      </span>
                    </div>

                    <div className="qr-status-indicator">
                      {isCancelled ? (
                        <span className="status-pill status-cancelled">Cancelled</span>
                      ) : isCheckedIn ? (
                        <span className="status-pill status-confirmed">
                          <CheckCircle2 size={13} /> Checked In
                        </span>
                      ) : (
                        <span className="status-pill status-pending">
                          Ready to Board
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="qr-code-box">
                    {t.qrCode ? (
                      <img
                        src={t.qrCode}
                        alt={`QR Code for Ticket ${t.ticketId}`}
                        className="qr-image"
                      />
                    ) : (
                      <div className="qr-placeholder">Generating QR...</div>
                    )}
                  </div>

                  <div className="qr-card-footer">
                    <span className="qr-ticket-id-label">TICKET ID</span>
                    <span className="qr-ticket-id-val">{t.ticketId}</span>
                    {isCheckedIn && t.checkedInAt && (
                      <span className="checked-in-timestamp">
                        Verified at: {new Date(t.checkedInAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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
            • Carry a valid government photo ID along with this digital or printed QR e-ticket.
          </p>
          <p>• Verified RedBus QR E-Ticket & Conductor Verification System.</p>
        </div>
      </div>

      {/* Ticket Action Buttons (Hidden during printing) */}
      <div className="ticket-action-buttons no-print">
        <button onClick={handlePrint} className="primary-button print-ticket-btn">
          <Printer size={17} />
          <span>Print / Save E-Ticket</span>
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
              This will cancel all passenger QR tickets and release seats (
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
