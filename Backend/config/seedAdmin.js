const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("Admin seed skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD to seed an admin.");
    return;
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log("Admin already exists. Seed skipped.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Admin.create({ email, password: hashedPassword });
  console.log(`Admin seeded: ${email}`);
};

module.exports = seedAdmin;
