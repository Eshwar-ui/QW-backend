const mongoose = require("mongoose");
const dbConfig = require("../src/utils/dbConfig");
const Employee = require("../src/models/Employees");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log(error));

// Function to check admin emails
async function checkAdminEmails() {
  try {
    console.log("Checking for admin emails...\n");

    // Check for QWIT-1001 (Admin 1)
    const admin1 = await Employee.findOne({ employeeId: "QWIT-1001" });
    if (admin1) {
      console.log("Admin 1 (QWIT-1001):");
      console.log(`  Email: "${admin1.email}"`);
      console.log(`  Email type: ${typeof admin1.email}`);
      console.log(`  Email length: ${admin1.email?.length}`);
      console.log(`  Matches 'admin@quantumworks.in'? ${admin1.email === 'admin@quantumworks.in'}`);
      console.log(`  Lowercase matches? ${admin1.email?.toLowerCase() === 'admin@quantumworks.in'}`);
    } else {
      console.log("Admin 1 (QWIT-1001): NOT FOUND");
    }

    console.log("\n");

    // Check for QWIT-1002 (Admin 2)
    const admin2 = await Employee.findOne({ employeeId: "QWIT-1002" });
    if (admin2) {
      console.log("Admin 2 (QWIT-1002):");
      console.log(`  Email: "${admin2.email}"`);
      console.log(`  Email type: ${typeof admin2.email}`);
      console.log(`  Email length: ${admin2.email?.length}`);
    } else {
      console.log("Admin 2 (QWIT-1002): NOT FOUND");
    }

    console.log("\n");

    // Try to find by email directly
    const findByEmail = await Employee.findOne({ email: "admin@quantumworks.in" });
    console.log(`Direct email search for 'admin@quantumworks.in': ${findByEmail ? 'FOUND' : 'NOT FOUND'}`);

    // Try case-insensitive search
    const findByEmailCaseInsensitive = await Employee.findOne({ 
      email: { $regex: /^admin@quantumworks\.in$/i } 
    });
    console.log(`Case-insensitive email search: ${findByEmailCaseInsensitive ? 'FOUND' : 'NOT FOUND'}`);
    if (findByEmailCaseInsensitive) {
      console.log(`  Found email: "${findByEmailCaseInsensitive.email}"`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking emails:", error);
    process.exit(1);
  }
}

// Run the check function
checkAdminEmails();

