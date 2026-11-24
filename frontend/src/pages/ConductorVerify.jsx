import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  MapPin,
  QrCode,
  Scan,
  ShieldCheck,
  Ticket as TicketIcon,
  User,
  UserCheck,
  XCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import { checkInPassenger, getRecentTickets, verifyTicket } from "../services/api";

export default function ConductorVerify() {
  const navigate = useNavigate();

  const [ticketIdInput, setTicketIdInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkInFeedback, setCheckInFeedback] = useState("");
  const [recentTickets, setRecentTickets] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Load recent tickets for quick testing
  const fetchRecent = async () => {
    setLoadingRecent(true);
    try {
      const data = await getRecentTickets();
      setRecentTickets(data.tickets || []);
    } catch {
      // Quiet fail if none
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleVerify = async (e, forcedId) => {
    if (e) e.preventDefault();
    const targetId = (forcedId || ticketIdInput).trim();

    if (!targetId) {
      setErrorMessage("Please enter or scan a valid Ticket ID.");
      return;
    }

    setVerifying(true);
    setErrorMessage("");
    setCheckInFeedback("");
    setVerificationResult(null);

    try {
      // If user pasted/scanned raw JSON { "ticketId": "..." }, extract ticketId
      let resolvedId = targetId;
      try {
        const parsed = JSON.parse(targetId);
        if (parsed.ticketId) resolvedId = parsed.ticketId;
      } catch {
        // Plain string ticket ID
      }

      setTicketIdInput(resolvedId);

      const response = await verifyTicket(resolvedId);
      setVerificationResult(response);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Ticket not found. Please verify the Ticket ID and try again.";
      setErrorMessage(msg);
      if (err.response?.data) {
        setVerificationResult(err.response.data);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleQuickTestSelect = (ticketId) => {
    setTicketIdInput(ticketId);
    handleVerify(null, ticketId);
  };

  const handleCheckIn = async () => {
    if (!verificationResult?.ticket?.ticketId) return;

    setCheckingIn(true);
    setCheckInFeedback("");

    try {
      const response = await checkInPassenger(verificationResult.ticket.ticketId);
      setVerificationResult((prev) => ({
        ...prev,
        verdict: "ALREADY_CHECKED_IN",
        message: response.message,
        ticket: response.ticket
      }));
      setCheckInFeedback(response.message);
      // Refresh recent list to update status badge
      fetchRecent();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to check in passenger.";
      alert(msg);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleReset = () => {
    setTicketIdInput("");
    setVerificationResult(null);
    setErrorMessage("");
    setCheckInFeedback("");
  };

  const ticket = verificationResult?.ticket;
  const verdict = verificationResult?.verdict;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="conductor-container">
        {/* Header navigation bar */}
        <div className="conductor-header-bar">
          <button
            onClick={() => navigate("/home")}
            className="back-button"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>

          <div className="conductor-actions-right">
            <button
              type="button"
              onClick={() => setShowGuide((prev) => !prev)}
              className="guide-toggle-btn"
            >
              <HelpCircle size={15} />
              <span>{showGuide ? "Hide Guide" : "How Verification Works"}</span>
            </button>

            <div className="conductor-badge">
              <ShieldCheck size={16} />
              <span>Conductor Portal</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions Guide (Collapsible) */}
        {showGuide && (
          <div className="conductor-guide-box">
            <h4>📋 How Conductor QR Verification Works</h4>
            <ol>
              <li>
                <strong>Passenger Presents QR Code:</strong> When a traveler books tickets, each passenger receives a unique QR code on their booking confirmation or <em>My Bookings</em> page.
              </li>
              <li>
                <strong>Scan or Enter Ticket ID:</strong> The QR code contains the minimal payload: <code>{`{"ticketId": "RBUS-TKT-..."}`}</code>. You can scan it using any barcode/QR scanner or copy-paste the Ticket ID shown under the QR code.
              </li>
              <li>
                <strong>Click "Verify Ticket":</strong> The system checks the MongoDB database to verify seat assignment, scheduled route, passenger name, and cancellation status.
              </li>
              <li>
                <strong>Click "Confirm & Check In Passenger":</strong> Once verified as valid, click the green check-in button to stamp the passenger's boarding time in the system.
              </li>
            </ol>
          </div>
        )}

        {/* Verification Scanner / Input Card */}
        <div className="conductor-scan-card">
          <div className="scan-card-header">
            <div className="scan-title-group">
              <QrCode size={24} className="text-red" />
              <h2>Verify Passenger Boarding Pass</h2>
            </div>
            <p className="scan-subtitle">
              Scan the passenger's QR Code or type the Ticket ID (e.g. <code>RBUS-TKT-...</code>) to verify boarding validity.
            </p>
          </div>

          <form onSubmit={handleVerify} className="conductor-input-form">
            <div className="ticket-input-wrap">
              <input
                type="text"
                placeholder="Scan QR payload or enter Ticket ID (e.g. RBUS-TKT-MWU2...)"
                value={ticketIdInput}
                onChange={(e) => {
                  setTicketIdInput(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                className="conductor-ticket-input"
              />
              <button
                type="submit"
                disabled={verifying}
                className="primary-button verify-submit-btn"
              >
                <Scan size={18} />
                <span>{verifying ? "Verifying..." : "Verify Ticket"}</span>
              </button>
            </div>

            {ticketIdInput && (
              <button
                type="button"
                onClick={handleReset}
                className="clear-input-btn"
              >
                Clear Input
              </button>
            )}
          </form>

          {/* Quick-Test / Recent Tickets Selection */}
          {recentTickets.length > 0 && (
            <div className="quick-test-section">
              <span className="quick-test-label">
                <TicketIcon size={14} className="text-red" />
                Quick Test (Click any recent ticket to verify):
              </span>
              <div className="quick-test-pills">
                {recentTickets.map((t) => (
                  <button
                    key={t.ticketId}
                    type="button"
                    onClick={() => handleQuickTestSelect(t.ticketId)}
                    className={`quick-pill ${
                      t.verificationStatus === "checked_in"
                        ? "pill-checked"
                        : t.status === "cancelled"
                        ? "pill-cancelled"
                        : "pill-ready"
                    }`}
                    title={`Click to verify ${t.passengerName} (Seat ${t.seatNumber})`}
                  >
                    <span className="pill-seat">{t.seatNumber}</span>
                    <span className="pill-name">{t.passengerName}</span>
                    <span className="pill-id">{t.ticketId.slice(-6)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="error-box conductor-alert">
              <XCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {checkInFeedback && (
            <div className="success-box conductor-alert">
              <CheckCircle2 size={18} />
              <span>{checkInFeedback}</span>
            </div>
          )}
        </div>

        {/* Verification Result Card */}
        {verificationResult && (
          <div className="verification-result-card">
            {/* Verdict Status Banner */}
            <div
              className={`verdict-banner ${
                verdict === "VALID"
                  ? "verdict-valid"
                  : verdict === "ALREADY_CHECKED_IN"
                  ? "verdict-checked-in"
                  : "verdict-invalid"
              }`}
            >
              <div className="verdict-icon">
                {verdict === "VALID" ? (
                  <CheckCircle2 size={32} />
                ) : verdict === "ALREADY_CHECKED_IN" ? (
                  <UserCheck size={32} />
                ) : (
                  <AlertTriangle size={32} />
                )}
              </div>
              <div className="verdict-text">
                <h3>
                  {verdict === "VALID"
                    ? "TICKET VALID — READY TO BOARD"
                    : verdict === "ALREADY_CHECKED_IN"
                    ? "PASSENGER ALREADY CHECKED IN"
                    : verdict === "CANCELLED"
                    ? "TICKET CANCELLED"
                    : "INVALID TICKET"}
                </h3>
                <p>{verificationResult.message}</p>
              </div>
            </div>

            {/* Passenger & Ticket Details */}
            {ticket && (
              <div className="verified-ticket-details">
                <div className="ticket-info-grid">
                  <div className="info-item">
                    <span className="info-label">Passenger Name</span>
                    <span className="info-value font-bold">{ticket.passengerName}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Assigned Seat</span>
                    <span className="seat-badge-pill font-bold" style={{ fontSize: "16px" }}>
                      {ticket.seatNumber}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Passenger Demographics</span>
                    <span className="info-value">
                      {ticket.passengerAge} yrs • {ticket.passengerGender}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Ticket ID</span>
                    <span className="info-value font-mono">{ticket.ticketId}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Route</span>
                    <span className="info-value font-bold">
                      {ticket.from} → {ticket.to}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Journey Date</span>
                    <span className="info-value font-bold">{ticket.journeyDate}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Scheduled Time</span>
                    <span className="info-value">
                      {ticket.departureTime} - {ticket.arrivalTime}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">Booking Code</span>
                    <span className="info-value font-mono">{ticket.bookingCode}</span>
                  </div>
                </div>

                {/* Check In Action CTA */}
                {verdict === "VALID" && (
                  <div className="check-in-action-area">
                    <button
                      type="button"
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="primary-button check-in-btn"
                    >
                      <UserCheck size={20} />
                      <span>{checkingIn ? "Checking In..." : "Confirm & Check In Passenger"}</span>
                    </button>
                  </div>
                )}

                {ticket.verificationStatus === "checked_in" && ticket.checkedInAt && (
                  <div className="checked-in-timestamp-banner">
                    <CheckCircle2 size={16} className="text-green" />
                    <span>
                      Boarded & Verified on {new Date(ticket.checkedInAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
