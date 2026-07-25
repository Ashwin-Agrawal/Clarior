const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let initialized = false;

try {
  const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log("[FIREBASE ADMIN] Initialized using service account JSON");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8");
    const serviceAccount = JSON.parse(decoded);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log("[FIREBASE ADMIN] Initialized using environment variables");
  } else {
    // Fallback initialize without credentials (will warn if token verification is attempted without admin setup)
    admin.initializeApp();
    console.warn("[FIREBASE ADMIN] Warning: Initialized default app without service account keys. Token verification will require firebase-service-account.json!");
  }
} catch (err) {
  console.error("[FIREBASE ADMIN] Initialization error:", err.message);
}

module.exports = admin;
