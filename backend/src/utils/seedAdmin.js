const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);

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

