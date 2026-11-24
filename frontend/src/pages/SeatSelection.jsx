import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bus, Calendar, Clock, MapPin, RefreshCw, ShieldAlert } from "lucide-react";
import Navbar from "../components/Navbar";
import SeatLayout from "../components/SeatLayout";
import SeatSummary from "../components/SeatSummary";
import { getSeatAvailability } from "../services/api";

export default function SeatSelection() {
  const { busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Retrieve bus details and journey date from navigation state or URL params
  const bus = location.state?.bus;
  const journeyDate =
    location.state?.journeyDate || searchParams.get("date") || "";

  const [bookedSeats, setBookedSeats] = useState([]);
  const [availableSeatsCount, setAvailableSeatsCount] = useState(40);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectionWarning, setSelectionWarning] = useState("");

  const MAX_SEATS = 6;

  // Fetch seat availability from backend on mount
  const fetchAvailability = async () => {
    if (!busId || !journeyDate) {
      setError("Missing bus ID or journey date. Please search buses again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getSeatAvailability(busId, journeyDate);
      setBookedSeats(data.bookedSeats || []);
      setAvailableSeatsCount(data.availableSeats !== undefined ? data.availableSeats : 40);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to load seat availability. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [busId, journeyDate]);

  // Handle seat click (selection & deselection)
  const handleSeatToggle = (seatNumber) => {
    setSelectionWarning("");

    if (bookedSeats.includes(seatNumber)) {
      return; // Cannot select booked seats
    }

    if (selectedSeats.includes(seatNumber)) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      // Check maximum 6 seats limit
      if (selectedSeats.length >= MAX_SEATS) {
        setSelectionWarning(`You can select a maximum of ${MAX_SEATS} seats per booking.`);
        return;
      }
      // Add seat to selection (sorted numerically for neatness)
      const nextSeats = [...selectedSeats, seatNumber].sort((a, b) => {
        const numA = parseInt(a.replace("S", ""), 10);
        const numB = parseInt(b.replace("S", ""), 10);
        return numA - numB;
      });
      setSelectedSeats(nextSeats);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="seat-selection-container">
        {/* Navigation back bar */}
        <div className="seat-selection-header-bar">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Back to Search Results"
          >
            <ArrowLeft size={18} />
            <span>Back to Search Results</span>
          </button>

          <button
            onClick={fetchAvailability}
            className="modify-search-button refresh-btn"
            title="Refresh Seat Availability"
          >
            <RefreshCw size={15} />
            <span>Refresh Availability</span>
          </button>
        </div>

        {/* Bus Information Section */}
        {bus ? (
          <div className="bus-info-banner-card">
            <div className="banner-primary-details">
              <div className="banner-title-row">
                <h2 className="banner-bus-name">{bus.busName}</h2>
                <span className="bus-number-badge">{bus.busNumber}</span>
                <span className="bus-type-badge badge-ac">{bus.busType}</span>
              </div>

              <div className="banner-route-row">
                <span className="banner-route-item font-bold">
                  <MapPin size={16} className="text-red" />
                  {bus.from}
                </span>
                <span className="route-arrow">→</span>
                <span className="banner-route-item font-bold">
                  <MapPin size={16} className="text-red" />
                  {bus.to}
                </span>
              </div>
            </div>

            <div className="banner-meta-details">
              <div className="meta-box">
                <Clock size={16} className="text-red" />
                <div className="meta-text">
                  <span className="meta-label">Schedule</span>
                  <span className="meta-value font-bold">
                    {bus.departureTime} - {bus.arrivalTime} ({bus.duration})
                  </span>
                </div>
              </div>

              <div className="meta-box">
                <Calendar size={16} className="text-red" />
                <div className="meta-text">
                  <span className="meta-label">Journey Date</span>
                  <span className="meta-value font-bold">{journeyDate || "N/A"}</span>
                </div>
              </div>

              <div className="meta-box price-box">
                <div className="meta-text text-right">
                  <span className="meta-label">Ticket Fare</span>
                  <span className="meta-value text-red font-bold price-highlight">
                    ₹{bus.price} <small>/ seat</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bus-info-banner-card">
            <h2>Bus #{busId}</h2>
            <p>Journey Date: {journeyDate}</p>
          </div>
        )}

        {/* Alerts & Errors */}
        {error && (
          <div className="error-box results-alert">
            <p>{error}</p>
            <button
              onClick={fetchAvailability}
              className="primary-button inline-btn"
            >
              Retry
            </button>
          </div>
        )}

        {selectionWarning && (
          <div className="warning-box">
            <ShieldAlert size={18} />
            <span>{selectionWarning}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading live seat availability from MongoDB...</p>
          </div>
        ) : (
          /* Main Seat Selection Grid (Layout + Summary) */
          <div className="seat-booking-grid">
            <div className="seat-layout-column">
              <div className="layout-section-header">
                <h3>Select Your Seats</h3>
                <span className="available-count-tag">
                  {availableSeatsCount} Seats Available
                </span>
              </div>

              <SeatLayout
                bookedSeats={bookedSeats}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                maxSelection={MAX_SEATS}
              />
            </div>

            <div className="seat-summary-column">
              <SeatSummary
                bus={bus || { id: Number(busId), price: 0 }}
                journeyDate={journeyDate}
                selectedSeats={selectedSeats}
                onValidationError={(msg) => setSelectionWarning(msg)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

