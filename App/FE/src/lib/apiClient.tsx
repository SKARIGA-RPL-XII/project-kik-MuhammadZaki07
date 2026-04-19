import axios from "axios";
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/banned";
    }

    return Promise.reject(error);
  },
);
