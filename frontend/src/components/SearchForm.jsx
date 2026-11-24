import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Calendar, MapPin, Search } from "lucide-react";
import { searchBuses } from "../services/api";

const PREDEFINED_CITIES = [
  "Erode",
  "Chennai",
  "Coimbatore",
  "Bangalore",
  "Salem",
  "Madurai",
  "Trichy",
  "Tiruppur"
];

// Helper to get today's date formatted as YYYY-MM-DD in local time
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SearchForm({
  initialFrom = "",
  initialTo = "",
  initialDate = "",
  compact = false,
  onSearchSuccess
}) {
  const navigate = useNavigate();

  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [journeyDate, setJourneyDate] = useState(initialDate || getTodayDateString());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const todayStr = getTodayDateString();

  const handleSwap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
    setError("");
  };

  const validate = () => {
    if (!fromCity) {
      setError("Please select a departure (From) city.");
      return false;
    }
    if (!toCity) {
      setError("Please select an arrival (To) city.");
      return false;
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      setError("Departure and arrival cities cannot be the same.");
      return false;
    }
    if (!journeyDate) {
      setError("Please select a journey date.");
      return false;
    }
    if (journeyDate < todayStr) {
      setError("Journey date cannot be in the past.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const data = await searchBuses(fromCity, toCity, journeyDate);

      if (onSearchSuccess) {
        onSearchSuccess({
          buses: data.buses,
          searchParams: { from: fromCity, to: toCity, date: journeyDate }
        });
      } else {
        navigate(
          `/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${encodeURIComponent(journeyDate)}`,
          {
            state: {
              buses: data.buses,
              searchParams: { from: fromCity, to: toCity, date: journeyDate }
            }
          }
        );
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        "Failed to search buses. Please check your connection and try again.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`search-form-card ${compact ? "compact" : ""}`}>
      {error && <div className="error-box search-error">{error}</div>}

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-fields-row">
          {/* From City */}
          <div className="search-field-group">
            <label htmlFor="from-city" className="search-field-label">
              <MapPin size={16} className="text-red" />
              <span>From</span>
            </label>
            <select
              id="from-city"
              value={fromCity}
              onChange={(e) => {
                setFromCity(e.target.value);
                setError("");
              }}
              className="search-select"
            >
              <option value="">Select Departure City</option>
              {PREDEFINED_CITIES.map((city) => (
                <option key={`from-${city}`} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            className="swap-button"
            onClick={handleSwap}
            title="Swap departure and arrival cities"
            aria-label="Swap locations"
          >
            <ArrowLeftRight size={18} />
          </button>

          {/* To City */}
          <div className="search-field-group">
            <label htmlFor="to-city" className="search-field-label">
              <MapPin size={16} className="text-red" />
              <span>To</span>
            </label>
            <select
              id="to-city"
              value={toCity}
              onChange={(e) => {
                setToCity(e.target.value);
                setError("");
              }}
              className="search-select"
            >
              <option value="">Select Arrival City</option>
              {PREDEFINED_CITIES.map((city) => (
                <option key={`to-${city}`} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Journey Date */}
          <div className="search-field-group">
            <label htmlFor="journey-date" className="search-field-label">
              <Calendar size={16} className="text-red" />
              <span>Journey Date</span>
            </label>
            <input
              type="date"
              id="journey-date"
              min={todayStr}
              value={journeyDate}
              onChange={(e) => {
                setJourneyDate(e.target.value);
                setError("");
              }}
              className="search-input-date"
            />
          </div>

          {/* Search Buses Button */}
          <div className="search-button-group">
            <button
              type="submit"
              disabled={loading}
              className="primary-button search-submit-button"
            >
              <Search size={18} />
              <span>{loading ? "Searching..." : "Search Buses"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

