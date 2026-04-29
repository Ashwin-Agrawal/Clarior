const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const slotRoutes = require("./routes/slot.routes");
const bookingRoutes = require("./routes/booking.routes");
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const reviewRoutes = require("./routes/review.routes");
const withdrawRoutes = require("./routes/withdraw.routes");
const googleRoutes = require("./routes/google.routes");
const globalErrorHandler = require("./middleware/errorHandler.middleware");

const paymentRoutes = require("./routes/payments.routes");

const app = express();

// ─── 🌐 CORS (must come BEFORE helmet & other middleware) ───
const allowedOrigins = new Set(
  String(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

// Safe fallback so production doesn't break if env var is missing.
allowedOrigins.add("https://clarior-frontend.vercel.app");
allowedOrigins.add("https://www.clarior-frontend.vercel.app");

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:3000");
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://localhost:5174");
  allowedOrigins.add("http://localhost:5175");
  allowedOrigins.add("http://127.0.0.1:5173");
  allowedOrigins.add("http://127.0.0.1:5174");
  allowedOrigins.add("http://127.0.0.1:5175");
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server).
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // Keep in sync with frontend request interceptors/custom headers.
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

// Handle preflight (OPTIONS) for ALL routes first
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// 🔐 Security — configured to NOT conflict with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  })
);

// 🔒 Additional Security Headers + FIXED CSP
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // ✅ FIXED CSP (IMPORTANT)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.razorpay.com https://www.googleapis.com https://clarior-frontend.vercel.app https://clarior-backend.onrender.com; frame-src https://checkout.razorpay.com;"
  );

  next();
});

// 🛡️ RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  },
  skipSuccessfulRequests: true,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many payment attempts. Please try again later."
  },
});

app.use(limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/payment", paymentLimiter);

// 🧠 Body Parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// 🍪 Cookies
app.use(cookieParser());

// 🧪 Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running 🚀",
  });
});

// 🚀 ROUTES
if (process.env.NODE_ENV !== "production") {
  app.use("/api/test", testRoutes);
}

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/google", googleRoutes);

app.use("/api/payment", paymentRoutes);

// ❗ 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// 🔥 ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
