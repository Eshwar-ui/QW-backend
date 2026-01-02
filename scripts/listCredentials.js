const mongoose = require("mongoose");
const dbConfig = require("../src/utils/dbConfig");
const Employee = require("../src/models/Employees");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected for listing credentials"))
  .catch((error) => console.log(error));

// Function to list all credentials
async function listCredentials() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("USER CREDENTIALS LIST");
    console.log("=".repeat(60) + "\n");

    // Get all employees
    const employees = await Employee.find({})
      .select("employeeId email firstName lastName role")
      .sort({ employeeId: 1 });

    if (employees.length === 0) {
      console.log("No employees found in database!");
      process.exit(0);
    }

    console.log(`📋 Total Users: ${employees.length}\n`);
    console.log(`🔑 Password for ALL users: Test@123\n`);

    // Separate admins and employees
    const admins = employees.filter(
      (e) => e.role === "Admin" || e.employeeId === "QWIT-1001"
    );
    const regularEmployees = employees.filter(
      (e) => e.role === "Employee" && e.employeeId !== "QWIT-1001"
    );

    // Display Admin Users
    if (admins.length > 0) {
      console.log("=".repeat(60));
      console.log("👑 ADMIN USERS");
      console.log("=".repeat(60));
      admins.forEach((emp, index) => {
        console.log(`\n${index + 1}. Admin User:`);
        console.log(`   📧 Email: ${emp.email || "N/A"}`);
        console.log(`   🆔 Employee ID: ${emp.employeeId || "N/A"}`);
        console.log(`   👤 Name: ${emp.firstName || "N/A"} ${emp.lastName || "N/A"}`);
        console.log(`   🔑 Password: Test@123`);
      });
      console.log("\n");
    }

    // Display Employee Users
    if (regularEmployees.length > 0) {
      console.log("=".repeat(60));
      console.log("👥 EMPLOYEE USERS");
      console.log("=".repeat(60));
      regularEmployees.forEach((emp, index) => {
        console.log(`\n${index + 1}. Employee:`);
        console.log(`   📧 Email: ${emp.email || "N/A"}`);
        console.log(`   🆔 Employee ID: ${emp.employeeId || "N/A"}`);
        console.log(`   👤 Name: ${emp.firstName || "N/A"} ${emp.lastName || "N/A"}`);
        console.log(`   🔑 Password: Test@123`);
      });
      console.log("\n");
    }

    // Summary
    console.log("=".repeat(60));
    console.log("SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Admins: ${admins.length}`);
    console.log(`Total Employees: ${regularEmployees.length}`);
    console.log(`\nAll users can login with password: Test@123`);
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("Error listing credentials:", error);
    process.exit(1);
  }
}

// Run the function
listCredentials();

