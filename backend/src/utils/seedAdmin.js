const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !adminPassword) return;

  // Fix 14: Password strength check — must be at least 8 characters
  if (!adminPassword || adminPassword.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
    isVerified: true,
    applicationStatus: null,
  });

  // eslint-disable-next-line no-console
  console.log(`✅ Seeded admin user: ${email}`);
}

module.exports = seedAdmin;

