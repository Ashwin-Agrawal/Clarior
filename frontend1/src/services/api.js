import axios from "axios";

const api = axios.create({
  baseURL: "https://clarior-backend.onrender.com/api",
  withCredentials: true, // 🔥 ENABLE COOKIES
  timeout: 30000, // 🔒 Add request timeout
});

// 🔥 REQUEST INTERCEPTOR - Add security headers
api.interceptors.request.use(
  (config) => {
    // Add X-Requested-With header to prevent CSRF
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔥 RESPONSE INTERCEPTOR - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔒 Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
