const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dbConfig = require("../src/utils/dbConfig");
const Employee = require("../src/models/Employees");
const Attendance = require("../src/models/Attendance");
const Leave = require("../src/models/Leaves");
const Payslips = require("../src/models/EmployeesPayslips");
const EmployeeLocation = require("../src/models/EmployeeLocation");
const Notification = require("../src/models/Notification");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected for cleaning up employees"))
  .catch((error) => console.log(error));

// Function to delete employees without names or employeeId
async function deleteEmployeesWithoutName() {
  try {
    console.log("Starting cleanup of employees without names or employeeId...\n");

    // Find employees without firstName, lastName, or employeeId
    const employeesToDelete = await Employee.find({
      $or: [
        { firstName: { $exists: false } },
        { firstName: null },
        { firstName: "" },
        { lastName: { $exists: false } },
        { lastName: null },
        { lastName: "" },
        { employeeId: { $exists: false } },
        { employeeId: null },
        { employeeId: "" },
      ]
    });

    console.log(`Found ${employeesToDelete.length} employee(s) without names or employeeId:\n`);

    if (employeesToDelete.length === 0) {
      console.log("No invalid employees found. Database is clean!");
      process.exit(0);
    }

    // Display employees to be deleted
    employeesToDelete.forEach((emp, index) => {
      console.log(`${index + 1}. Employee ID: ${emp.employeeId || 'MISSING'}`);
      console.log(`   Email: ${emp.email || 'N/A'}`);
      console.log(`   First Name: ${emp.firstName || 'MISSING'}`);
      console.log(`   Last Name: ${emp.lastName || 'MISSING'}`);
      console.log(`   _id: ${emp._id}`);
      console.log("");
    });

    let deleted = 0;
    let relatedDataDeleted = {
      attendance: 0,
      leaves: 0,
      payslips: 0,
      locations: 0,
      notifications: 0
    };

    // Delete each employee and their related data
    for (const employee of employeesToDelete) {
      const employeeId = employee.employeeId;
      const employeeMongoId = employee._id.toString();
      
      console.log(`Deleting employee with _id: ${employeeMongoId}${employeeId ? ` (employeeId: ${employeeId})` : ' (NO EMPLOYEE ID)'}`);

      // Delete related data only if employeeId exists
      if (employeeId) {
        const attendanceResult = await Attendance.deleteMany({ employeeId });
        relatedDataDeleted.attendance += attendanceResult.deletedCount;
        if (attendanceResult.deletedCount > 0) {
          console.log(`  ✓ Deleted ${attendanceResult.deletedCount} attendance records`);
        }

        const leavesResult = await Leave.deleteMany({ employeeId });
        relatedDataDeleted.leaves += leavesResult.deletedCount;
        if (leavesResult.deletedCount > 0) {
          console.log(`  ✓ Deleted ${leavesResult.deletedCount} leave records`);
        }

        const payslipsResult = await Payslips.deleteMany({ employeeId });
        relatedDataDeleted.payslips += payslipsResult.deletedCount;
        if (payslipsResult.deletedCount > 0) {
          console.log(`  ✓ Deleted ${payslipsResult.deletedCount} payslip records`);
        }

        const locationsResult = await EmployeeLocation.deleteMany({ employeeId });
        relatedDataDeleted.locations += locationsResult.deletedCount;
        if (locationsResult.deletedCount > 0) {
          console.log(`  ✓ Deleted ${locationsResult.deletedCount} location records`);
        }

        const notificationsResult = await Notification.deleteMany({
          $or: [
            { recipientId: employeeId },
            { senderId: employeeId }
          ]
        });
        relatedDataDeleted.notifications += notificationsResult.deletedCount;
        if (notificationsResult.deletedCount > 0) {
          console.log(`  ✓ Deleted ${notificationsResult.deletedCount} notification records`);
        }
      } else {
        console.log(`  ⚠️  No employeeId found - skipping related data deletion`);
      }

      // Delete the employee (always delete, even without employeeId)
      await Employee.findByIdAndDelete(employee._id);
      deleted++;
      console.log(`  ✓ Deleted employee record\n`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("Cleanup Summary:");
    console.log("=".repeat(50));
    console.log(`✓ Deleted ${deleted} employee(s) without names or employeeId`);
    console.log(`✓ Deleted ${relatedDataDeleted.attendance} attendance records`);
    console.log(`✓ Deleted ${relatedDataDeleted.leaves} leave records`);
    console.log(`✓ Deleted ${relatedDataDeleted.payslips} payslip records`);
    console.log(`✓ Deleted ${relatedDataDeleted.locations} location records`);
    console.log(`✓ Deleted ${relatedDataDeleted.notifications} notification records`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("Error deleting employees:", error);
    process.exit(1);
  }
}

// Run the cleanup function
deleteEmployeesWithoutName();

