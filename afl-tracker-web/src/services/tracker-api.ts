import axios from "axios";
import type { ImageData, Location } from "@/types";
import { useAuthStore } from "@/stores/auth";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  const token = authStore.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default {
  async getTrackerData(): Promise<ImageData[]> {
    const response = await apiClient.get<ImageData[]>("/images");
    return response.data;
  },

  async uploadImage(formData: FormData, location: Location): Promise<ImageData> {
    // Add location data to form
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());

    const response = await apiClient.post<ImageData>("/images/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
};