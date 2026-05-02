import axios from "axios";

const apiBaseUrl =
  (import.meta.env.VITE_API_URL || "https://clarior-backend.onrender.com/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
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
    // 🔒 Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      
      const isAuthCheck = error.config?.url?.includes("/users/me");
      const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
      
      // Only redirect if it's not an initial auth check and not already on auth pages
      if (!isAuthCheck && !isAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
