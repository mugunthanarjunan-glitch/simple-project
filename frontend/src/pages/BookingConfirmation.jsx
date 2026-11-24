import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Home, ListOrdered } from "lucide-react";
import Navbar from "../components/Navbar";
import TicketDetails from "../components/TicketDetails";
import { cancelBooking, getBookingDetails } from "../services/api";

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");

  // Fetch verified booking from backend if not passed in navigation state
  useEffect(() => {
    if (location.state?.booking) {
      setBooking(location.state.booking);
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getBookingDetails(bookingId);
        setBooking(response.booking);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Failed to retrieve booking information. Please check your Booking ID.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, location.state]);

  const handleCancelBooking = async (idToCancel) => {
    setIsCancelling(true);
    setCancelFeedback("");
    try {
      const response = await cancelBooking(idToCancel);
      setBooking(response.booking);
      setCancelFeedback("Your ticket has been cancelled and seats have been released.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel booking. Please try again.";
      alert(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="confirmation-container">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Fetching your verified booking details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-box results-alert">
            <p>{error}</p>
            <button onClick={() => navigate("/home")} className="primary-button inline-btn">
              Back to Home
            </button>
          </div>
        )}

        {/* Confirmed Ticket Display */}
        {!loading && !error && booking && (
          <div className="confirmation-content-wrap">
            {/* Success Celebration Banner */}
            {booking.status === "confirmed" && (
              <div className="success-confirmation-banner">
                <div className="success-banner-icon">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <div className="success-banner-text">
                  <h2>Booking Confirmed!</h2>
                  <p>
                    Your bus ticket has been successfully booked. An electronic copy has been generated below.
                  </p>
                </div>
              </div>
            )}

            {cancelFeedback && (
              <div className="warning-box">
                <span>{cancelFeedback}</span>
              </div>
            )}

            {/* Boarding Pass / Ticket View */}
            <TicketDetails
              booking={booking}
              onCancelBooking={handleCancelBooking}
              isCancelling={isCancelling}
            />

            {/* Post-Booking Navigation Options */}
            <div className="confirmation-footer-nav no-print">
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="secondary-nav-btn"
              >
                <ListOrdered size={16} />
                <span>View My Bookings</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="primary-button home-nav-btn"
              >
                <Home size={16} />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

