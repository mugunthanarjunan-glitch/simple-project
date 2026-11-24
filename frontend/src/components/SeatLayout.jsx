import Seat from "./Seat";
import { Disc } from "lucide-react";

/**
 * Generates 10 rows of 4 seats (2+2 layout):
 * Row 1: [S1, S2] | aisle | [S3, S4]
 * ...
 * Row 10: [S37, S38] | aisle | [S39, S40]
 */
const SEAT_ROWS = Array.from({ length: 10 }, (_, rowIndex) => {
  const startNum = rowIndex * 4 + 1;
  return {
    rowNumber: rowIndex + 1,
    leftSeats: [`S${startNum}`, `S${startNum + 1}`],
    rightSeats: [`S${startNum + 2}`, `S${startNum + 3}`]
  };
});

export default function SeatLayout({
  bookedSeats = [],
  selectedSeats = [],
  onSeatToggle,
  maxSelection = 6
}) {
  const getSeatStatus = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return "booked";
    if (selectedSeats.includes(seatNumber)) return "selected";
    return "available";
  };

  return (
    <div className="seat-layout-card">
      {/* Legend */}
      <div className="seat-legend-box">
        <div className="legend-item">
          <span className="legend-sample seat-available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-sample seat-selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-sample seat-booked"></span>
          <span>Booked</span>
        </div>
      </div>

      {/* Bus Top-View Frame */}
      <div className="bus-chassis">
        {/* Front Indicator / Driver Cab */}
        <div className="bus-front-bar">
          <span className="bus-front-label">BUS FRONT</span>
          <div className="driver-cabin" title="Driver Cabin">
            <Disc size={22} className="driver-wheel-icon" />
            <span className="driver-text">Driver</span>
          </div>
        </div>

        {/* 2+2 Seating Rows */}
        <div className="seats-grid-area">
          {SEAT_ROWS.map((row) => (
            <div key={`row-${row.rowNumber}`} className="seat-row">
              {/* Left pair (Window & Aisle) */}
              <div className="seat-pair left-pair">
                {row.leftSeats.map((seatNum) => (
                  <Seat
                    key={seatNum}
                    seatNumber={seatNum}
                    status={getSeatStatus(seatNum)}
                    onClick={onSeatToggle}
                  />
                ))}
              </div>

              {/* Walking Aisle */}
              <div className="walking-aisle">
                <span className="aisle-row-indicator">{row.rowNumber}</span>
              </div>

              {/* Right pair (Aisle & Window) */}
              <div className="seat-pair right-pair">
                {row.rightSeats.map((seatNum) => (
                  <Seat
                    key={seatNum}
                    seatNumber={seatNum}
                    status={getSeatStatus(seatNum)}
                    onClick={onSeatToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bus Rear Bar */}
        <div className="bus-rear-bar">
          <span>BUS REAR</span>
        </div>
      </div>
    </div>
  );
}

