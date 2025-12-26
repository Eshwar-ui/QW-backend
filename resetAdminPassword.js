const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dbConfig = require("./utils/dbConfig");
const Employee = require("./models/Employees");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log(error));

// Function to reset admin password
async function resetAdminPassword() {
  try {
    console.log("Resetting admin password...\n");

    // Find admin user (QWIT-1001)
    const admin = await Employee.findOne({ employeeId: "QWIT-1001" });
    
    if (!admin) {
      console.log("Admin user (QWIT-1001) not found!");
      process.exit(1);
    }

    console.log(`Admin found: ${admin.firstName} ${admin.lastName}`);
    console.log(`Email: ${admin.email}`);

    // Hash the new password
    const newPassword = "admin@123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    console.log("\n✅ Admin password reset successfully!");
    console.log(`New password: ${newPassword}`);

    // Verify the password works
    const testMatch = await bcrypt.compare(newPassword, admin.password);
    console.log(`Password verification: ${testMatch ? "✅ PASSED" : "❌ FAILED"}`);

    process.exit(0);
  } catch (error) {
    console.error("Error resetting admin password:", error);
    process.exit(1);
  }
}

// Run the reset function
resetAdminPassword();

