const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[FIREBASE ADMIN] Initialized using service account JSON file");
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8");
      const serviceAccount = JSON.parse(decoded);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[FIREBASE ADMIN] Initialized using FIREBASE_SERVICE_ACCOUNT_BASE64 env var");
    } else {
      // Fallback initialize with project ID so default app exists and verifyIdToken can function
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "clarior-494409";
      admin.initializeApp({
        projectId: projectId,
      });
      console.log(`[FIREBASE ADMIN] Initialized default app for project: ${projectId}`);
    }
  } catch (err) {
    console.error("[FIREBASE ADMIN] Initialization error:", err.message);
  }
}

module.exports = admin;
