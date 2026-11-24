import { User } from "lucide-react";

export default function PassengerForm({
  index,
  seatNumber,
  passenger,
  onChange,
  errors = {}
}) {
  return (
    <div className="passenger-card">
      <div className="passenger-card-header">
        <div className="passenger-title">
          <User size={18} className="text-red" />
          <span>Passenger {index + 1}</span>
        </div>
        <div className="passenger-seat-badge">
          <span>Seat: <strong>{seatNumber}</strong></span>
        </div>
      </div>

      <div className="passenger-form-fields">
        {/* Seat Number (Read-only) */}
        <div className="form-group seat-readonly-group">
          <label className="form-label">Seat No.</label>
          <input
            type="text"
            value={seatNumber}
            readOnly
            disabled
            className="form-input readonly-input"
          />
        </div>

        {/* Passenger Name */}
        <div className="form-group flex-2">
          <label className="form-label">
            Full Name <span className="required-star">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Kumar"
            value={passenger.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
            className={`form-input ${errors.name ? "input-error" : ""}`}
            maxLength={60}
          />
          {errors.name && <span className="field-error-msg">{errors.name}</span>}
        </div>

        {/* Passenger Age */}
        <div className="form-group age-group">
          <label className="form-label">
            Age <span className="required-star">*</span>
          </label>
          <input
            type="number"
            placeholder="Age"
            min={1}
            max={100}
            value={passenger.age || ""}
            onChange={(e) => onChange(index, "age", e.target.value)}
            className={`form-input ${errors.age ? "input-error" : ""}`}
          />
          {errors.age && <span className="field-error-msg">{errors.age}</span>}
        </div>

        {/* Passenger Gender */}
        <div className="form-group gender-group">
          <label className="form-label">
            Gender <span className="required-star">*</span>
          </label>
          <select
            value={passenger.gender || ""}
            onChange={(e) => onChange(index, "gender", e.target.value)}
            className={`form-select ${errors.gender ? "input-error" : ""}`}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <span className="field-error-msg">{errors.gender}</span>}
        </div>
      </div>
    </div>
  );
}

