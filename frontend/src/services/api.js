import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true
});

/**
 * Searches for buses matching source, destination, and journey date.
 */
export const searchBuses = async (from, to, date) => {
  const response = await api.get("/buses/search", {
    params: { from, to, date }
  });
  return response.data;
};

/**
 * Retrieves seat availability for a specific bus and journey date.
 */
export const getSeatAvailability = async (busId, date) => {
  const response = await api.get(`/seats/${busId}`, {
    params: { date }
  });
  return response.data;
};

/**
 * Validates selected seat numbers before continuing to passenger details.
 */
export const validateSelectedSeats = async (busId, journeyDate, selectedSeats) => {
  const response = await api.post("/seats/validate", {
    busId,
    journeyDate,
    selectedSeats
  });
  return response.data;
};

/**
 * Creates a confirmed bus ticket booking.
 */
export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

/**
 * Fetches all confirmed and cancelled bookings of the currently logged-in user.
 */
export const getMyBookings = async () => {
  const response = await api.get("/bookings/my-bookings");
  return response.data;
};

/**
 * Fetches details of a specific booking by bookingId.
 */
export const getBookingDetails = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

/**
 * Cancels a confirmed booking and releases reserved seats.
 */
export const cancelBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`);
  return response.data;
};

/**
 * Verifies a passenger's ticket for conductor boarding check.
 * @param {string} ticketId - Unique Ticket ID (e.g. RBUS-TKT-XXXX)
 * @returns {Promise<{success: boolean, verdict: string, message: string, ticket: Object}>}
 */
export const verifyTicket = async (ticketId) => {
  const response = await api.post("/tickets/verify", { ticketId });
  return response.data;
};

/**
 * Conductor checks in a verified passenger.
 * @param {string} ticketId - Unique Ticket ID
 * @returns {Promise<{success: boolean, verdict: string, message: string, ticket: Object}>}
 */
export const checkInPassenger = async (ticketId) => {
  const response = await api.post("/tickets/check-in", { ticketId });
  return response.data;
};

/**
 * Fetches individual passenger tickets with QR codes for a booking.
 * @param {string} bookingId - Booking ID
 * @returns {Promise<{success: boolean, count: number, tickets: Array}>}
 */
export const getTicketsByBooking = async (bookingId) => {
  const response = await api.get(`/tickets/booking/${bookingId}`);
  return response.data;
};

export default api;

/**
 * Fetches recent tickets for conductor quick-test selection.
 */
export const getRecentTickets = async () => {
  const response = await api.get("/tickets/recent");
  return response.data;
};
