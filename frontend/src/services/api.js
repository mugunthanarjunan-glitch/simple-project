import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true
});

/**
 * Searches for buses matching source, destination, and journey date.
 * @param {string} from - Source city
 * @param {string} to - Destination city
 * @param {string} date - Journey date (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, message: string, count: number, buses: Array}>}
 */
export const searchBuses = async (from, to, date) => {
  const response = await api.get("/buses/search", {
    params: { from, to, date }
  });
  return response.data;
};

/**
 * Retrieves seat availability for a specific bus and journey date.
 * @param {number|string} busId - Bus ID
 * @param {string} date - Journey date (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, busId: number, journeyDate: string, totalSeats: number, bookedSeats: string[], availableSeats: number}>}
 */
export const getSeatAvailability = async (busId, date) => {
  const response = await api.get(`/seats/${busId}`, {
    params: { date }
  });
  return response.data;
};

/**
 * Validates selected seat numbers before continuing to passenger details.
 * @param {number|string} busId - Bus ID
 * @param {string} journeyDate - Journey date (YYYY-MM-DD)
 * @param {string[]} selectedSeats - Array of selected seat numbers (e.g. ["S1", "S2"])
 * @returns {Promise<{success: boolean, message: string, busId: number, journeyDate: string, selectedSeats: string[], pricePerSeat: number, totalAmount: number}>}
 */
export const validateSelectedSeats = async (busId, journeyDate, selectedSeats) => {
  const response = await api.post("/seats/validate", {
    busId,
    journeyDate,
    selectedSeats
  });
  return response.data;
};

export default api;
