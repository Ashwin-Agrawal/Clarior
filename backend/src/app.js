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

const paymentRoutes = require("./routes/payments.routes"); // use if needed

const app = express();

// 🔐 Security
app.use(helmet());

// 🔒 Additional Security Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // 🔒 Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.razorpay.com https://www.googleapis.com; frame-src https://checkout.razorpay.com;"
  );
  next();
});

// 🛡️ RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🛡️ Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  },
  skipSuccessfulRequests: true,
});

// 🛡️ Stricter rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 payment attempts per hour
  message: {
    success: false,
    message: "Too many payment attempts. Please try again later."
  },
});

app.use(limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/payment", paymentLimiter);

// 🌐 CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser clients / same-origin (e.g. curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = new Set(
        String(process.env.CORS_ORIGINS || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );

      // Only add localhost origins in development
      if (process.env.NODE_ENV !== "production") {
        allowed.add("http://localhost:3000");
        allowed.add("http://localhost:5173");
        allowed.add("http://localhost:5174");
        allowed.add("http://localhost:5175");
        allowed.add("http://127.0.0.1:5173");
        allowed.add("http://127.0.0.1:5174");
        allowed.add("http://127.0.0.1:5175");
      }

      if (allowed.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);


// 🧠 Body Parser
app.use(express.json({ limit: "1mb" })); // 🔒 Prevent large payloads
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
// 🧪 Test routes only available in development
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

app.use("/api/payment", paymentRoutes); // optional

// ❗ 404 LAST
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// 🔥 GLOBAL ERROR HANDLER (MUST BE LAST)
app.use(globalErrorHandler);

module.exports = app;