import { useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, Armchair } from "lucide-react";

export default function BusCard({ bus, journeyDate }) {
  const navigate = useNavigate();

  const handleBookSeats = () => {
    navigate(`/seats/${bus.id}`, {
      state: {
        bus,
        journeyDate
      }
    });
  };

  const isAc = bus.busType?.toLowerCase().includes("ac");
  const isSleeper = bus.busType?.toLowerCase().includes("sleeper");

  return (
    <div className="bus-card">
      <div className="bus-card-left">
        <div className="bus-card-header">
          <h3 className="bus-name">{bus.busName}</h3>
          <span className="bus-number-badge">{bus.busNumber}</span>
          <span
            className={`bus-type-badge ${isAc ? "badge-ac" : "badge-nonac"}`}
          >
            {bus.busType}
          </span>
        </div>

        <div className="bus-timing-row">
          <div className="time-block">
            <span className="time-value">{bus.departureTime}</span>
            <span className="city-label">{bus.from}</span>
          </div>

          <div className="duration-block">
            <span className="duration-text">
              <Clock size={13} className="inline-icon" /> {bus.duration}
            </span>
            <div className="duration-line">
              <span className="line-dot start"></span>
              <span className="line-bar"></span>
              <span className="line-dot end"></span>
            </div>
          </div>

          <div className="time-block">
            <span className="time-value">{bus.arrivalTime}</span>
            <span className="city-label">{bus.to}</span>
          </div>
        </div>

        <div className="bus-features">
          <span className="feature-item">
            <Armchair size={14} />
            {isSleeper ? "Spacious Berths" : "Pushback Seats"}
          </span>
          <span className="feature-item">
            <ShieldCheck size={14} />
            Verified RedBus Partner
          </span>
        </div>
      </div>

      <div className="bus-card-right">
        <div className="price-section">
          <span className="price-label">Starts from</span>
          <span className="price-value">₹{bus.price}</span>
        </div>

        <div className="seats-info">
          <span className="seats-count">
            {bus.availableSeats !== undefined ? bus.availableSeats : bus.totalSeats}
          </span>
          <span className="seats-label">Seats Available</span>
        </div>

        <button
          onClick={handleBookSeats}
          className="book-seats-button"
          aria-label={`Book Seats for ${bus.busName}`}
        >
          Book Seats
        </button>
      </div>
    </div>
  );
}

