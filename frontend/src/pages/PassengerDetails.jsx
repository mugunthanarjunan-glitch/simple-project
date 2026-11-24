import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Bus, Calendar, Clock, Mail, MapPin, Phone, ShieldAlert, UserCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import PassengerForm from "../components/PassengerForm";
import BookingSummary from "../components/BookingSummary";
import { useAuth } from "../context/AuthContext";
import { createBooking } from "../services/api";

export default function PassengerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const bus = location.state?.bus;
  const journeyDate = location.state?.journeyDate || "";
  const selectedSeats = location.state?.selectedSeats || [];

  // Initialize passenger list with one object per selected seat
  const [passengers, setPassengers] = useState(() =>
    selectedSeats.map((seatNumber) => ({
      name: "",
      age: "",
      gender: "",
      seatNumber
    }))
  );

  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactMobile, setContactMobile] = useState(user?.mobile || "");

  const [errors, setErrors] = useState({});
  const [contactErrors, setContactErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seatConflict, setSeatConflict] = useState(false);

  // Redirect if no bus or seats passed
  useEffect(() => {
    if (!bus || !selectedSeats.length || !journeyDate) {
      navigate("/home", { replace: true });
    }
  }, [bus, selectedSeats, journeyDate, navigate]);

  // Update specific passenger field
  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error for field if fixed
    if (errors[index]?.[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (next[index]) {
          delete next[index][field];
          if (Object.keys(next[index]).length === 0) delete next[index];
        }
        return next;
      });
    }
  };

  // Validate passenger inputs and contact info
  const validateForm = () => {
    const newErrors = {};
    const newContactErrors = {};
    let isValid = true;

    // Validate each passenger
    passengers.forEach((p, idx) => {
      const pErrors = {};
      const trimmedName = p.name?.trim();

      if (!trimmedName) {
        pErrors.name = "Full name is required";
        isValid = false;
      } else if (trimmedName.length < 2) {
        pErrors.name = "Name must be at least 2 characters";
        isValid = false;
      } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
        pErrors.name = "Name can only contain letters, spaces, and hyphens";
        isValid = false;
      }

      const numAge = Number(p.age);
      if (!p.age || isNaN(numAge)) {
        pErrors.age = "Age is required";
        isValid = false;
      } else if (numAge < 1 || numAge > 100) {
        pErrors.age = "Age must be between 1 and 100";
        isValid = false;
      }

      if (!p.gender) {
        pErrors.gender = "Gender is required";
        isValid = false;
      }

      if (Object.keys(pErrors).length > 0) {
        newErrors[idx] = pErrors;
      }
    });

    // Validate Contact Details
    const cleanEmail = contactEmail?.trim();
    if (!cleanEmail) {
      newContactErrors.email = "Contact email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      newContactErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    const cleanMobile = contactMobile?.trim();
    if (!cleanMobile) {
      newContactErrors.mobile = "Contact mobile number is required";
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newContactErrors.mobile = "Please enter a valid 10-digit mobile number (starts with 6-9)";
      isValid = false;
    }

    setErrors(newErrors);
    setContactErrors(newContactErrors);
    return isValid;
  };

  const handleConfirmBooking = async () => {
    setApiError("");
    setSeatConflict(false);

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        busId: bus.id,
        journeyDate,
        selectedSeats,
        passengers: passengers.map((p) => ({
          name: p.name.trim(),
          age: Number(p.age),
          gender: p.gender,
          seatNumber: p.seatNumber
        })),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactMobile: contactMobile.trim()
      };

      const response = await createBooking(payload);

      if (response.success && response.booking) {
        navigate(`/booking-confirmation/${response.booking.bookingId}`, {
          state: { booking: response.booking }
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message ||
        "An unexpected error occurred while processing your booking. Please try again.";

      setApiError(msg);

      if (status === 409) {
        // Seat already taken
        setSeatConflict(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="passenger-details-container">
        {/* Navigation Bar */}
        <div className="seat-selection-header-bar">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            aria-label="Back to Seat Selection"
          >
            <ArrowLeft size={18} />
            <span>Back to Seat Selection</span>
          </button>
        </div>

        {/* Selected Bus Banner */}
        {bus && (
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
                  <span className="meta-label">Departure - Arrival</span>
                  <span className="meta-value font-bold">
                    {bus.departureTime} - {bus.arrivalTime} ({bus.duration})
                  </span>
                </div>
              </div>

              <div className="meta-box">
                <Calendar size={16} className="text-red" />
                <div className="meta-text">
                  <span className="meta-label">Journey Date</span>
                  <span className="meta-value font-bold">{journeyDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner / Conflict Alert */}
        {apiError && (
          <div className="error-box passenger-error-alert">
            <div className="alert-content">
              <ShieldAlert size={20} className="alert-icon" />
              <span>{apiError}</span>
            </div>
            {seatConflict && (
              <button
                type="button"
                onClick={() => navigate(`/seats/${bus.id}`, { state: { bus, journeyDate } })}
                className="primary-button inline-btn reselect-seats-btn"
              >
                Return to Seat Selection
              </button>
            )}
          </div>
        )}

        {/* Main Grid: Passenger Forms (left) + Summary (right) */}
        <div className="passenger-booking-grid">
          <div className="passenger-forms-column">
            {/* Passenger Information Cards */}
            <div className="passenger-section-card">
              <div className="section-card-title-row">
                <UserCheck size={20} className="text-red" />
                <h3 className="section-card-title">Passenger Information</h3>
                <span className="passenger-count-pill">
                  {selectedSeats.length} {selectedSeats.length === 1 ? "Passenger" : "Passengers"}
                </span>
              </div>

              <div className="passenger-cards-list">
                {passengers.map((p, idx) => (
                  <PassengerForm
                    key={`seat-form-${p.seatNumber}`}
                    index={idx}
                    seatNumber={p.seatNumber}
                    passenger={p}
                    onChange={handlePassengerChange}
                    errors={errors[idx] || {}}
                  />
                ))}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="contact-details-card">
              <div className="section-card-title-row">
                <Mail size={19} className="text-red" />
                <h3 className="section-card-title">Contact & Ticket Delivery Details</h3>
              </div>
              <p className="contact-helper-text">
                Your ticket and booking status will be sent to these contact details.
              </p>

              <div className="contact-fields-grid">
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={14} className="inline-icon text-muted" />
                    <span>Email Address <span className="required-star">*</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. name@example.com"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      if (contactErrors.email) {
                        setContactErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    className={`form-input ${contactErrors.email ? "input-error" : ""}`}
                  />
                  {contactErrors.email && (
                    <span className="field-error-msg">{contactErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={14} className="inline-icon text-muted" />
                    <span>Mobile Number <span className="required-star">*</span></span>
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={contactMobile}
                    onChange={(e) => {
                      setContactMobile(e.target.value.replace(/\D/g, ""));
                      if (contactErrors.mobile) {
                        setContactErrors((prev) => ({ ...prev, mobile: "" }));
                      }
                    }}
                    className={`form-input ${contactErrors.mobile ? "input-error" : ""}`}
                  />
                  {contactErrors.mobile && (
                    <span className="field-error-msg">{contactErrors.mobile}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary Column */}
          <div className="booking-summary-column">
            <BookingSummary
              bus={bus}
              journeyDate={journeyDate}
              selectedSeats={selectedSeats}
              onConfirmBooking={handleConfirmBooking}
              loading={loading}
              apiError={apiError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

