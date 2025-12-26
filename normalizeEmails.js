const mongoose = require("mongoose");
const dbConfig = require("./utils/dbConfig");
const Employee = require("./models/Employees");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected for email normalization"))
  .catch((error) => console.log(error));

// Function to normalize all emails to lowercase
async function normalizeEmails() {
  try {
    console.log("Starting email normalization...");

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    let updated = 0;
    let unchanged = 0;

    for (const employee of employees) {
      const originalEmail = employee.email;
      
      // Skip if email is null or undefined
      if (!originalEmail || typeof originalEmail !== 'string') {
        console.log(`Skipping employee ${employee.employeeId} - email is null or invalid`);
        unchanged++;
        continue;
      }

      const normalizedEmail = originalEmail.trim().toLowerCase();

      // Only update if email needs normalization
      if (originalEmail !== normalizedEmail) {
        employee.email = normalizedEmail;
        await employee.save();
        console.log(`Updated: ${originalEmail} -> ${normalizedEmail} (${employee.employeeId})`);
        updated++;
      } else {
        unchanged++;
      }
    }

    console.log(`\nEmail normalization completed!`);
    console.log(`Updated: ${updated} emails`);
    console.log(`Unchanged: ${unchanged} emails`);

    process.exit(0);
  } catch (error) {
    console.error("Error normalizing emails:", error);
    process.exit(1);
  }
}

// Run the normalization function
normalizeEmails();

