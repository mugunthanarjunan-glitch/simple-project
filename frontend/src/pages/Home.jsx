import Navbar from "../components/Navbar";
import SearchForm from "../components/SearchForm";
import { useAuth } from "../context/AuthContext";
import { Bus, Clock, ShieldCheck, Ticket } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="home-container">
        {/* Hero Banner Section */}
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-tag">India's Reliable Bus Ticketing</span>
            <h1 className="hero-heading">
              Welcome, <span className="highlight-text">{user?.name || "Traveler"}</span>!
            </h1>
            <p className="hero-subheading">
              Book your bus tickets easily across Tamil Nadu and Karnataka with guaranteed seats.
            </p>
          </div>
        </section>

        {/* Bus Search Form Card */}
        <section className="search-section">
          <div className="search-card-container">
            <h2 className="search-card-title">Search Buses</h2>
            <SearchForm />
          </div>
        </section>

        {/* Informational Value Highlights */}
        <section className="highlights-section">
          <div className="highlight-card">
            <div className="highlight-icon-box">
              <Bus size={24} />
            </div>
            <div className="highlight-text-content">
              <h3>Direct Routes</h3>
              <p>Frequent buses connecting Erode, Chennai, Coimbatore, Bangalore, and more.</p>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon-box">
              <Ticket size={24} />
            </div>
            <div className="highlight-text-content">
              <h3>Instant Booking</h3>
              <p>Transparent pricing, live seat counts, and instant digital confirmation.</p>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon-box">
              <ShieldCheck size={24} />
            </div>
            <div className="highlight-text-content">
              <h3>Verified Operators</h3>
              <p>Travel with top-rated and reliable travel partners like KPN, SRS, and Orange.</p>
            </div>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon-box">
              <Clock size={24} />
            </div>
            <div className="highlight-text-content">
              <h3>On-Time Departure</h3>
              <p>Punctual schedules with dedicated support to make your journey pleasant.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
