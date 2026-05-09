import axios from "axios";

const apiBaseUrl =
  (import.meta.env.VITE_API_URL || "https://clarior-backend.onrender.com/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // 🔥 ENABLE COOKIES
  timeout: 30000, // 🔒 Add request timeout
});

// 🔒 Guard against rapid session-expired dispatches to prevent navigation loops.
let lastExpiryDispatch = 0;
const EXPIRY_THROTTLE = 2000;

// 🔥 REQUEST INTERCEPTOR - Add security headers
api.interceptors.request.use(
  (config) => {
    console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`);
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => {
    console.log("[API] Request Error:", error);
    return Promise.reject(error);
  }
);

// 🔥 RESPONSE INTERCEPTOR - Handle auth errors
// ⚠️ IMPORTANT: We dispatch a custom event instead of using window.location.href
// window.location.href causes a full page reload → remounts AuthContext → fetchUser fires
// again → another 401 → another reload → infinite loop.
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`[API] Error: ${error.response?.status} ${error.config?.url}`);
    if (error.response?.status === 401) {
      const isAuthCheck = error.config?.url?.includes("/users/me");
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthCheck && !isAuthPage) {
        const now = Date.now();
        if (now - lastExpiryDispatch > EXPIRY_THROTTLE) {
          lastExpiryDispatch = now;
          console.log("[API] Dispatching clarior:session-expired");
          window.dispatchEvent(new CustomEvent("clarior:session-expired"));
        } else {
          console.log("[API] session-expired throttled.");
        }
      } else {
        console.log("[API] 401 on auth check/page, not dispatching.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
