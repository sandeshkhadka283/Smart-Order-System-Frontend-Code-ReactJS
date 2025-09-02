import axios from "axios";

// Create an Axios instance


// Automatically choose URL based on environment
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:5000/api";


// Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    `➡️ [${new Date().toISOString()}] ${config.method.toUpperCase()} ${config.url}`,
    config.data || ""
  );

  return config;
});

// Response & Error logging
api.interceptors.response.use(
  (response) => {
    console.log(
      `⬅️ [${new Date().toISOString()}] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      `❌ [${new Date().toISOString()}] ${error.response?.status} ${error.config?.url}`,
      error.message
    );

    // Optional: Handle unauthorized access globally
    if (error.response?.status === 401) {
      console.warn("🔒 Token invalid or expired. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/"; // redirect to login or home
    }

    return Promise.reject(error);
  }
);

export default api;
