import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  async getTrackerData() {
    const response = await apiClient.get("/images");
    return response.data;
  },
};