const mongoose = require("mongoose");
const dbConfig = require("./utils/dbConfig");
const Employee = require("./models/Employees");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log(error));

// Function to fix admin email
async function fixAdminEmail() {
  try {
    console.log("Fixing admin email...\n");

    // Find admin user (QWIT-1001)
    const admin = await Employee.findOne({ employeeId: "QWIT-1001" });
    
    if (!admin) {
      console.log("Admin user (QWIT-1001) not found!");
      process.exit(1);
    }

    console.log(`Current email: "${admin.email}"`);
    console.log(`Updating to: "admin@quantumworks.in"`);

    // Update email
    admin.email = "admin@quantumworks.in";
    await admin.save();

    console.log("\n✅ Admin email updated successfully!");
    console.log(`New email: "${admin.email}"`);

    // Verify the update
    const verify = await Employee.findOne({ employeeId: "QWIT-1001" });
    console.log(`\nVerification - Email in DB: "${verify.email}"`);

    process.exit(0);
  } catch (error) {
    console.error("Error fixing admin email:", error);
    process.exit(1);
  }
}

// Run the fix function
fixAdminEmail();

