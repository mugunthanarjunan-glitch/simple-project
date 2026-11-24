import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar";
import BusCard from "../components/BusCard";
import SearchForm from "../components/SearchForm";
import { searchBuses } from "../services/api";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Retrieve search params from URL query or location state
  const fromCity = searchParams.get("from") || location.state?.searchParams?.from || "";
  const toCity = searchParams.get("to") || location.state?.searchParams?.to || "";
  const journeyDate = searchParams.get("date") || location.state?.searchParams?.date || "";

  const [buses, setBuses] = useState(location.state?.buses || null);
  const [loading, setLoading] = useState(!location.state?.buses);
  const [error, setError] = useState("");
  const [showModifySearch, setShowModifySearch] = useState(false);

  useEffect(() => {
    // If buses were already passed in location.state from Home page, use them
    if (location.state?.buses && !error) {
      setBuses(location.state.buses);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from backend using query parameters
    const fetchBuses = async () => {
      if (!fromCity || !toCity || !journeyDate) {
        setError("Missing search parameters. Please start a new search.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await searchBuses(fromCity, toCity, journeyDate);
        setBuses(response.buses || []);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Failed to load buses for the selected route. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [fromCity, toCity, journeyDate, location.state]);

  const handleModifySearchSuccess = ({ buses: updatedBuses, searchParams: updatedParams }) => {
    setBuses(updatedBuses);
    setShowModifySearch(false);
    navigate(
      `/search?from=${encodeURIComponent(updatedParams.from)}&to=${encodeURIComponent(updatedParams.to)}&date=${encodeURIComponent(updatedParams.date)}`,
      {
        replace: true,
        state: {
          buses: updatedBuses,
          searchParams: updatedParams
        }
      }
    );
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="results-container">
        {/* Results Route & Date Header */}
        <div className="results-header-card">
          <div className="results-header-top">
            <button
              onClick={() => navigate("/home")}
              className="back-button"
              aria-label="Back to Search"
            >
              <ArrowLeft size={18} />
              <span>Back to Search</span>
            </button>

            <button
              onClick={() => setShowModifySearch((prev) => !prev)}
              className="modify-search-button"
            >
              <SlidersHorizontal size={16} />
              <span>{showModifySearch ? "Close Form" : "Modify Search"}</span>
            </button>
          </div>

          <div className="route-details-summary">
            <div className="route-title-group">
              <div className="route-locations">
                <span className="route-city">{fromCity || "Origin"}</span>
                <span className="route-arrow">→</span>
                <span className="route-city">{toCity || "Destination"}</span>
              </div>
              <div className="route-meta">
                <span className="route-meta-item">
                  <Calendar size={15} />
                  {journeyDate || "Date not specified"}
                </span>
                {!loading && buses && (
                  <span className="route-meta-item bus-count-pill">
                    {buses.length} {buses.length === 1 ? "Bus" : "Buses"} Available
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Modify Search Form */}
          {showModifySearch && (
            <div className="modify-search-panel">
              <SearchForm
                initialFrom={fromCity}
                initialTo={toCity}
                initialDate={journeyDate}
                compact={true}
                onSearchSuccess={handleModifySearchSuccess}
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="error-box results-alert">
            <p>{error}</p>
            <button
              onClick={() => navigate("/home")}
              className="primary-button inline-btn"
            >
              Back to Search
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Searching available buses on this route...</p>
          </div>
        )}

        {/* Bus List Results */}
        {!loading && !error && buses && (
          <div className="buses-list-section">
            {buses.length > 0 ? (
              <div className="buses-list">
                {buses.map((bus) => (
                  <BusCard
                    key={`bus-${bus.id}`}
                    bus={bus}
                    journeyDate={journeyDate}
                  />
                ))}
              </div>
            ) : (
              <div className="no-buses-card">
                <div className="no-buses-icon">
                  <MapPin size={42} className="text-muted" />
                </div>
                <h3>No buses available for this route.</h3>
                <p>
                  We couldn't find any buses running from <strong>{fromCity}</strong> to{" "}
                  <strong>{toCity}</strong> on <strong>{journeyDate}</strong>.
                </p>
                <button
                  onClick={() => navigate("/home")}
                  className="primary-button back-search-btn"
                >
                  Back to Search
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

