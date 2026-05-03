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
// ⚠️ IMPORTANT: We dispatch a custom event instead of using window.location.href
// window.location.href causes a full page reload → remounts AuthContext → fetchUser fires
// again → another 401 → another reload → infinite loop.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthCheck = error.config?.url?.includes("/users/me");
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      // Only fire the event for real session expiry (not the initial /me check,
      // and not when the user is already on an auth page).
      if (!isAuthCheck && !isAuthPage) {
        // Let AuthContext / App catch this and do a soft React Router redirect.
        window.dispatchEvent(new CustomEvent("clarior:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
