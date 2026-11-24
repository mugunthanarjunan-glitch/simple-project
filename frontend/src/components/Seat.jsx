export default function Seat({ seatNumber, status, onClick }) {
  const isBooked = status === "booked";
  const isSelected = status === "selected";

  let statusClass = "seat-available"; // default green
  let statusLabel = "Available";

  if (isBooked) {
    statusClass = "seat-booked"; // red
    statusLabel = "Booked";
  } else if (isSelected) {
    statusClass = "seat-selected"; // blue
    statusLabel = "Selected";
  }

  return (
    <button
      type="button"
      className={`seat-item ${statusClass}`}
      onClick={isBooked ? undefined : () => onClick(seatNumber)}
      disabled={isBooked}
      title={`Seat ${seatNumber} - ${statusLabel}`}
      aria-label={`Seat ${seatNumber} ${statusLabel}`}
      aria-pressed={isSelected}
    >
      <span className="seat-icon-backrest"></span>
      <span className="seat-number-text">{seatNumber}</span>
    </button>
  );
}

