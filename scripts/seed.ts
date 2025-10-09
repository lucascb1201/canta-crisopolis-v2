import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Admin from "../src/models/Admin";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://admin:voting_password_2025@localhost:27017/voting?authSource=admin";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Admin.create({
      username: "admin",
      password: hashedPassword,
      email: "admin@voting.com",
    });

    console.log("✅ Admin user created successfully!");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Email: admin@voting.com");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
