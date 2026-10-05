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
  withCredentials: true, //  ENABLE COOKIES
  timeout: 30000, //  Add request timeout
});

//  Guard against rapid session-expired dispatches to prevent navigation loops.
let lastExpiryDispatch = 0;
const EXPIRY_THROTTLE = 2000;
const isDev = import.meta.env.DEV;

//  REQUEST INTERCEPTOR - Add security headers
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

//  RESPONSE INTERCEPTOR - Handle auth errors
// ️ IMPORTANT: We dispatch a custom event instead of using window.location.href
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

// ⚡ CLIENT-SIDE IN-MEMORY CACHE FOR STATIC/PUBLIC CATALOG ENDPOINTS
const requestCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

const isCacheableUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("/colleges") ||
    url.startsWith("/users/seniors")
  );
};

const originalGet = api.get.bind(api);

api.get = async function (url, config = {}) {
  // If skipCache is requested or URL is not cacheable, bypass
  if (config.skipCache || !isCacheableUrl(url)) {
    return originalGet(url, config);
  }

  const cacheKey = `${url}:${JSON.stringify(config.params || {})}`;
  const cached = requestCache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    if (isDev) console.log(`[API Cache] Returning cached: ${url}`);
    return Promise.resolve(cached.response);
  }

  const response = await originalGet(url, config);

  // Only cache successful 200 responses
  if (response && response.status === 200) {
    requestCache.set(cacheKey, {
      response,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  return response;
};

// Invalidate relevant cache on mutations
const invalidateCacheFor = (prefix) => {
  for (const key of requestCache.keys()) {
    if (key.includes(prefix)) {
      requestCache.delete(key);
    }
  }
};

const originalPost = api.post.bind(api);
api.post = async function (url, ...args) {
  if (url.includes("/colleges")) invalidateCacheFor("/colleges");
  if (url.includes("/users")) invalidateCacheFor("/users/seniors");
  return originalPost(url, ...args);
};

const originalPatch = api.patch.bind(api);
api.patch = async function (url, ...args) {
  if (url.includes("/colleges")) invalidateCacheFor("/colleges");
  if (url.includes("/users")) invalidateCacheFor("/users/seniors");
  return originalPatch(url, ...args);
};

const originalDelete = api.delete.bind(api);
api.delete = async function (url, ...args) {
  if (url.includes("/colleges")) invalidateCacheFor("/colleges");
  if (url.includes("/users")) invalidateCacheFor("/users/seniors");
  return originalDelete(url, ...args);
};

export default api;

