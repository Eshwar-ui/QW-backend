const mongoose = require("mongoose");
const dbConfig = require("../src/utils/dbConfig");
const Leave = require("../src/models/Leaves");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected for fetching leaves"))
  .catch((error) => console.log(error));

// Function to get leaves for employee ID QW1205
async function getLeavesForEmployee() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("LEAVES FOR EMPLOYEE ID: QW1205");
    console.log("=".repeat(60) + "\n");

    console.log("Querying database for leaves...");

    // Get all leaves for the employee
    const leaves = await Leave.find({ employeeId: 'QW1237' })
      .sort({ from: -1 }); // Sort by from date descending (most recent first)

    console.log(`Found ${leaves.length} leaves in database.`);

    if (leaves.length === 0) {
      console.log("No leaves found for employee ID QW1205!");
      process.exit(0);
    }

    console.log(`📋 Total Leaves: ${leaves.length}\n`);

    // Display each leave
    leaves.forEach((leave, index) => {
      console.log("=".repeat(60));
      console.log(`LEAVE ${index + 1}`);
      console.log("=".repeat(60));
      console.log(`   🆔 Employee ID: ${leave.employeeId}`);
      console.log(`   📅 Type: ${leave.type || "N/A"}`);
      console.log(`   📅 From: ${leave.from ? new Date(leave.from).toLocaleDateString() : "N/A"}`);
      console.log(`   📅 To: ${leave.to ? new Date(leave.to).toLocaleDateString() : "N/A"}`);
      console.log(`   📊 Days: ${leave.days || "N/A"}`);
      console.log(`   📝 Reason: ${leave.reason || "N/A"}`);
      console.log(`   📊 Status: ${leave.status || "N/A"}`);
      console.log(`   👤 Action By: ${leave.actionBy || "N/A"}`);
      console.log(`   ✅ Action: ${leave.action || "N/A"}`);
      console.log("");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error fetching leaves:", error);
    process.exit(1);
  }
}

// Run the function
getLeavesForEmployee();