// require('dotenv').config();
// const express=require('express');
// const connectDB = require('./src/db/db');
// const app=require('./src/app');

// connectDB();
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/db/db");
const seedAdmin = require("./src/utils/seedAdmin");
// Connect Database
connectDB();

// Handle uncaught errors (production safety)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥", err);
  process.exit(1);
});

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

seedAdmin().catch((err) => console.error("Admin seed failed:", err));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥", err);
  server.close(() => process.exit(1));
});