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

  async uploadImage(formData: FormData) {
    const response = await apiClient.post("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};