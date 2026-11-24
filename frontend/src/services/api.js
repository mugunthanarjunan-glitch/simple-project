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

export default api;
