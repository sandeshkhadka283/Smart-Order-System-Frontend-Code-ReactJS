import axios from "axios";

// URLs
const PROD_URL = process.env.REACT_APP_API_URL;
const LOCAL_URL = "http://localhost:5000/api";

// Use LOCAL_URL if PROD_URL is missing (especially useful during development)
const baseURL = LOCAL_URL;

const api = axios.create({ baseURL });

// Optional: Fallback if production server is unreachable
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.code === "ERR_NETWORK" &&
      error.config.baseURL === PROD_URL &&
      PROD_URL // only fallback if PROD_URL was actually defined
    ) {
      console.warn(
        "Production server unreachable. Falling back to local backend..."
      );
      return axios({ ...error.config, baseURL: LOCAL_URL });
    }
    return Promise.reject(error);
  }
);

// Token handling
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  console.log(
    `➡️ [${new Date().toISOString()}] ${config.method.toUpperCase()} ${config.url}`,
    config.data || ""
  );

  return config;
});

// Logging responses and errors
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

    if (error.response?.status === 401) {
      console.warn("🔒 Token invalid or expired. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
