import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168."));

  if (import.meta.env.DEV) {
    return "/api";
  }

  if (isLocalhost) {
    return "http://localhost:3002/api";
  }

  return "https://clarior-backend.onrender.com/api";
};

const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // 🔥 ENABLE COOKIES
  timeout: 30000, // 🔒 Add request timeout
});

// 🔒 Guard against rapid session-expired dispatches to prevent navigation loops.
let lastExpiryDispatch = 0;
const EXPIRY_THROTTLE = 2000;
const isDev = import.meta.env.DEV;

// 🔥 REQUEST INTERCEPTOR - Add security headers
api.interceptors.request.use(
  (config) => {
    if (isDev) console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`);
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    return config;
  },
  (error) => {
    if (isDev) console.log("[API] Request Error:", error);
    return Promise.reject(error);
  }
);

// 🔥 RESPONSE INTERCEPTOR - Handle auth errors
// ⚠️ IMPORTANT: We dispatch a custom event instead of using window.location.href
// window.location.href causes a full page reload → remounts AuthContext → fetchUser fires
// again → another 401 → another reload → infinite loop.
api.interceptors.response.use(
  (response) => {
    if (isDev) console.log(`[API] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (isDev) console.log(`[API] Error: ${error.response?.status} ${error.config?.url}`);
    if (error.response?.status === 401) {
      const isAuthCheck = error.config?.url?.includes("/users/me");
      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthCheck && !isAuthPage) {
        const now = Date.now();
        if (now - lastExpiryDispatch > EXPIRY_THROTTLE) {
          lastExpiryDispatch = now;
          if (isDev) console.log("[API] Dispatching clarior:session-expired");
          window.dispatchEvent(new CustomEvent("clarior:session-expired"));
        } else {
          if (isDev) console.log("[API] session-expired throttled.");
        }
      } else {
        if (isDev) console.log("[API] 401 on auth check/page, not dispatching.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
