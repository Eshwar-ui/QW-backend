const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dbConfig = require("./utils/dbConfig");
const Employee = require("./models/Employees");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leaves");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected for updating users"))
  .catch((error) => console.log(error));

// Common password for all users (for testing)
const TEST_PASSWORD = "Test@123";

// Sample data arrays for generating random data
const firstNames = [
  "Rajesh", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Kavita",
  "Suresh", "Meera", "Arjun", "Divya", "Kiran", "Pooja", "Manoj", "Swati",
  "Nikhil", "Riya", "Deepak", "Shreya", "Ravi", "Neha", "Sandeep", "Anita",
  "Vishal", "Kriti", "Gaurav", "Sakshi", "Harsh", "Tanvi"
];

const lastNames = [
  "Kumar", "Sharma", "Patel", "Singh", "Reddy", "Gupta", "Verma", "Yadav",
  "Khan", "Joshi", "Shah", "Desai", "Mehta", "Rao", "Malhotra", "Agarwal",
  "Nair", "Iyer", "Menon", "Pillai", "Narayan", "Krishnan", "Sundaram", "Raman"
];

const departments = [
  "Engineering", "Design", "Marketing", "Sales", "Human Resources", 
  "Quality Assurance", "Operations", "Finance", "IT Support", "Product"
];

const designations = [
  "Software Developer", "Senior Software Developer", "UI/UX Designer", 
  "Marketing Manager", "Sales Executive", "HR Manager", "QA Engineer",
  "DevOps Engineer", "Product Manager", "Business Analyst", "Team Lead",
  "Project Manager", "Graphic Designer", "Content Writer", "Data Analyst"
];

const grades = ["A1", "A2", "B1", "B2", "C1", "C2"];

const genders = ["Male", "Female", "Other"];

const banks = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", 
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda",
  "Canara Bank", "Union Bank of India", "Indian Bank"
];

const cities = [
  "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", 
  "Kolkata", "Ahmedabad", "Jaipur", "Surat"
];

const states = [
  "Karnataka", "Maharashtra", "Delhi", "Telangana", "Tamil Nadu",
  "Gujarat", "West Bengal", "Rajasthan"
];

const leaveTypes = ["Sick Leave", "Casual Leave", "Earned Leave", "Personal Leave", "Emergency Leave"];

// Generate random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random number in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random element from array
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random phone number
function randomPhone() {
  return `9${randomInt(100000000, 999999999)}`;
}

// Generate random PAN number
function randomPAN() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let pan = "";
  for (let i = 0; i < 5; i++) pan += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) pan += numbers[Math.floor(Math.random() * numbers.length)];
  pan += letters[Math.floor(Math.random() * letters.length)];
  return pan;
}

// Generate random account number
function randomAccountNumber() {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
}

// Generate random IFSC code
function randomIFSC() {
  const bankCodes = ["SBIN", "HDFC", "ICIC", "UTIB", "KKBK", "PUNB", "BARB", "CNRB", "UBIN", "IDIB"];
  return `${randomElement(bankCodes)}0${randomInt(1000, 9999)}`;
}

// Generate random UAN/ESI number
function randomUAN() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
}

// Generate sample employee data
function generateSampleEmployeeData(employeeId, index) {
  const firstName = randomElement(firstNames);
  const lastName = randomElement(lastNames);
  const gender = randomElement(genders);
  const department = randomElement(departments);
  const designation = randomElement(designations);
  const grade = randomElement(grades);
  const city = randomElement(cities);
  const state = randomElement(states);
  const bank = randomElement(banks);
  
  // Generate dates
  const dateOfBirth = randomDate(new Date(1985, 0, 1), new Date(1998, 11, 31));
  const joiningDate = randomDate(new Date(2020, 0, 1), new Date(2023, 11, 31));
  
  // Generate email
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@quantumworks.in`;
  
  return {
    firstName,
    lastName,
    employeeId,
    email,
    mobile: randomPhone(),
    dateOfBirth,
    joiningDate,
    password: TEST_PASSWORD, // Will be hashed later
    profileImage: "",
    department,
    designation,
    gender,
    grade,
    role: employeeId === "QWIT-1001" ? "Admin" : "Employee",
    report: employeeId === "QWIT-1001" ? "" : "QWIT-1001",
    address: `${randomInt(1, 999)} ${department} Street, ${city}, ${state}`,
    bankname: bank,
    accountnumber: randomAccountNumber(),
    ifsccode: randomIFSC(),
    PANno: randomPAN(),
    UANno: randomUAN(),
    ESIno: randomUAN(),
    fathername: `${randomElement(firstNames)} ${lastName}`,
    mobileAccessEnabled: Math.random() > 0.5, // Random true/false
  };
}

// Generate sample attendance data for a user
async function generateAttendanceData(employeeId, employeeName, joiningDate) {
  const attendanceRecords = [];
  const today = new Date();
  const startDate = new Date(joiningDate);
  startDate.setMonth(startDate.getMonth() - 1); // Start from 1 month before joining
  
  // Generate attendance for last 3 months
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() - 3);
  
  let currentDate = new Date(endDate);
  
  while (currentDate <= today) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 80% chance of attendance
      if (Math.random() > 0.2) {
        // Generate punch in time (between 8:00 AM and 10:00 AM)
        const punchInHour = randomInt(8, 10);
        const punchInMinute = randomInt(0, 59);
        const punchIn = new Date(currentDate);
        punchIn.setHours(punchInHour, punchInMinute, 0, 0);
        
        // Generate punch out time (between 5:00 PM and 7:00 PM)
        const punchOutHour = randomInt(17, 19);
        const punchOutMinute = randomInt(0, 59);
        const punchOut = new Date(currentDate);
        punchOut.setHours(punchOutHour, punchOutMinute, 0, 0);
        
        // Calculate working time (in seconds)
        const workingTime = (punchOut - punchIn) / 1000;
        
        // Generate break time (30 minutes to 1 hour)
        const breakTime = randomInt(1800, 3600);
        
        attendanceRecords.push({
          employeeId,
          employeeName,
          punchIn,
          punchOut,
          breakTime,
          totalWorkingTime: workingTime - breakTime,
          lastPunchedIn: punchIn,
          lastPunchedOut: punchOut,
          lastPunchType: "PunchOut",
        });
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return attendanceRecords;
}

// Generate sample leave data for a user
async function generateLeaveData(employeeId, joiningDate) {
  const leaveRecords = [];
  const today = new Date();
  const startDate = new Date(joiningDate);
  
  // Generate 2-5 leave records per user
  const numLeaves = randomInt(2, 5);
  
  for (let i = 0; i < numLeaves; i++) {
    const fromDate = randomDate(startDate, today);
    const days = randomInt(1, 5);
    const toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate() + days - 1);
    
    // Don't create leaves in the future
    if (toDate > today) continue;
    
    const statuses = ["New", "Approved", "Rejected"];
    const status = randomElement(statuses);
    
    leaveRecords.push({
      employeeId,
      type: randomElement(leaveTypes),
      from: fromDate,
      to: toDate,
      days,
      reason: `Sample leave reason ${i + 1}`,
      status,
      actionBy: status !== "New" ? "HR" : "-",
      action: status !== "New" ? status : "-",
    });
  }
  
  return leaveRecords;
}

// Main function to update all users
async function updateUsersToSampleData() {
  try {
    console.log("Starting user data update...\n");

    // Get all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees to update\n`);

    if (employees.length === 0) {
      console.log("No employees found in database!");
      process.exit(0);
    }

    // Check for employees with missing employeeId
    const employeesWithoutId = employees.filter(emp => !emp.employeeId || emp.employeeId.trim() === '');
    if (employeesWithoutId.length > 0) {
      console.log(`⚠️  WARNING: Found ${employeesWithoutId.length} employee(s) without employeeId:`);
      employeesWithoutId.forEach((emp, idx) => {
        console.log(`   ${idx + 1}. _id: ${emp._id}, email: ${emp.email || 'N/A'}`);
      });
      console.log(`\nThese employees will be skipped.\n`);
    }

    // Hash the test password once
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    console.log(`Test password: ${TEST_PASSWORD} (hashed)\n`);

    let updated = 0;
    let attendanceCreated = 0;
    let leavesCreated = 0;

    // Clear existing attendance and leaves
    console.log("Clearing existing attendance and leave records...");
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    console.log("Cleared existing records\n");

    // Update each employee
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      
      // Check if employeeId exists and is valid
      if (!employee.employeeId || employee.employeeId.trim() === '') {
        console.log(`⚠️  Skipping employee at index ${i} - missing or invalid employeeId`);
        console.log(`   Employee data:`, JSON.stringify(employee.toObject(), null, 2));
        continue;
      }
      
      const existingEmployeeId = employee.employeeId.trim();
      console.log(`Processing ${i + 1}/${employees.length}: ${existingEmployeeId} - ${employee.firstName || 'N/A'} ${employee.lastName || 'N/A'}`);

      // Generate new sample data
      const sampleData = generateSampleEmployeeData(existingEmployeeId, i);
      
      // Update employee fields individually to ensure employeeId is preserved
      // Don't use .set() as it might cause issues - update fields directly
      employee.firstName = sampleData.firstName;
      employee.lastName = sampleData.lastName;
      employee.email = sampleData.email.toLowerCase();
      employee.mobile = sampleData.mobile;
      employee.dateOfBirth = sampleData.dateOfBirth;
      employee.joiningDate = sampleData.joiningDate;
      employee.password = hashedPassword; // Same password for all
      employee.profileImage = sampleData.profileImage || "";
      employee.department = sampleData.department;
      employee.designation = sampleData.designation;
      employee.gender = sampleData.gender;
      employee.grade = sampleData.grade;
      employee.role = sampleData.role;
      employee.report = sampleData.report;
      employee.address = sampleData.address;
      employee.bankname = sampleData.bankname;
      employee.accountnumber = sampleData.accountnumber;
      employee.ifsccode = sampleData.ifsccode;
      employee.PANno = sampleData.PANno;
      employee.UANno = sampleData.UANno;
      employee.ESIno = sampleData.ESIno;
      employee.fathername = sampleData.fathername;
      employee.mobileAccessEnabled = sampleData.mobileAccessEnabled;
      
      // Explicitly ensure employeeId is set (should already be set, but just to be safe)
      employee.employeeId = existingEmployeeId;

      try {
        await employee.save();
        updated++;
        console.log(`  ✓ Updated employee data`);
      } catch (saveError) {
        console.error(`  ✗ Error saving employee ${existingEmployeeId}:`, saveError.message);
        if (saveError.errors) {
          console.error(`  Validation errors:`, JSON.stringify(saveError.errors, null, 2));
        }
        continue; // Skip this employee and move to next
      }

      // Generate and save attendance data
      const attendanceData = await generateAttendanceData(
        existingEmployeeId,
        `${sampleData.firstName} ${sampleData.lastName}`,
        sampleData.joiningDate
      );
      
      if (attendanceData.length > 0) {
        await Attendance.insertMany(attendanceData);
        attendanceCreated += attendanceData.length;
        console.log(`  ✓ Created ${attendanceData.length} attendance records`);
      }

      // Generate and save leave data
      const leaveData = await generateLeaveData(
        existingEmployeeId,
        sampleData.joiningDate
      );
      
      if (leaveData.length > 0) {
        await Leave.insertMany(leaveData);
        leavesCreated += leaveData.length;
        console.log(`  ✓ Created ${leaveData.length} leave records`);
      }

      console.log("");
    }

    console.log("\n" + "=".repeat(50));
    console.log("Update Summary:");
    console.log("=".repeat(50));
    console.log(`✓ Updated ${updated} employees`);
    console.log(`✓ Created ${attendanceCreated} attendance records`);
    console.log(`✓ Created ${leavesCreated} leave records`);
    console.log(`\nAll users now have password: ${TEST_PASSWORD}`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("Error updating users:", error);
    process.exit(1);
  }
}

// Run the update function
updateUsersToSampleData();

