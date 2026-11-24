import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  Ticket,
  XCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import TicketDetails from "../components/TicketDetails";
import { cancelBooking, getMyBookings } from "../services/api";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to load your bookings. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    setActionFeedback("");
    try {
      const response = await cancelBooking(bookingId);
      // Update booking in local list
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? response.booking : b))
      );
      setActionFeedback(`Booking ${bookingId} has been successfully cancelled.`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel booking.";
      alert(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpandTicket = (bookingId) => {
    setExpandedBookingId((prev) => (prev === bookingId ? null : bookingId));
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="results-container">
        {/* Header Bar */}
        <div className="seat-selection-header-bar">
          <button
            onClick={() => navigate("/home")}
            className="back-button"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>

          <button
            onClick={fetchBookings}
            className="modify-search-button refresh-btn"
            title="Refresh Bookings"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="my-bookings-header">
          <div className="my-bookings-title-group">
            <Ticket size={24} className="text-red" />
            <h2>My Bus Bookings</h2>
          </div>
          <span className="bookings-count-pill">
            {bookings.length} {bookings.length === 1 ? "Booking" : "Bookings"}
          </span>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="warning-box">
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="error-box results-alert">
            <p>{error}</p>
            <button onClick={fetchBookings} className="primary-button inline-btn">
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your booking history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="no-buses-card">
            <div className="no-buses-icon">
              <Ticket size={48} className="text-muted" />
            </div>
            <h3>No Bookings Found</h3>
            <p>You haven't booked any bus tickets yet. Search routes and reserve your seats now.</p>
            <button
              onClick={() => navigate("/home")}
              className="primary-button back-search-btn"
            >
              <Search size={16} />
              <span>Search & Book Buses</span>
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && bookings.length > 0 && (
          <div className="bookings-list-wrap">
            {bookings.map((b) => {
              const isCancelled = b.status === "cancelled";
              const isExpanded = expandedBookingId === b.bookingId;

              return (
                <div key={b.bookingId} className="booking-item-card">
                  <div className="booking-summary-bar">
                    <div className="booking-bar-left">
                      <div className="booking-id-row">
                        <span className="booking-id-tag">ID: {b.bookingId}</span>
                        <span
                          className={`status-pill ${
                            isCancelled ? "status-cancelled" : "status-confirmed"
                          }`}
                        >
                          {isCancelled ? "Cancelled" : "Confirmed"}
                        </span>
                      </div>

                      <h3 className="booking-bus-title">{b.busName}</h3>
                      <span className="bus-number-badge">{b.busNumber}</span>

                      <div className="booking-route-display">
                        <span className="font-bold">{b.from}</span>
                        <span className="route-arrow">→</span>
                        <span className="font-bold">{b.to}</span>
                      </div>
                    </div>

                    <div className="booking-bar-mid">
                      <div className="booking-meta-row">
                        <Calendar size={14} className="text-red" />
                        <span>Date: <strong>{b.journeyDate}</strong></span>
                      </div>

                      <div className="booking-meta-row">
                        <Clock size={14} className="text-red" />
                        <span>Seats: <strong>{b.selectedSeats?.join(", ")}</strong></span>
                      </div>

                      <div className="booking-meta-row">
                        <span>Fare: <strong className="text-red">₹{b.totalAmount}</strong></span>
                      </div>
                    </div>

                    <div className="booking-bar-right">
                      <button
                        type="button"
                        onClick={() => toggleExpandTicket(b.bookingId)}
                        className="view-ticket-btn"
                      >
                        <Eye size={15} />
                        <span>{isExpanded ? "Hide Ticket" : "View Ticket"}</span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Full Ticket View */}
                  {isExpanded && (
                    <div className="expanded-ticket-panel">
                      <TicketDetails
                        booking={b}
                        onCancelBooking={handleCancelBooking}
                        isCancelling={cancellingId === b.bookingId}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
