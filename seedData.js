const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dbConfig = require("./utils/dbConfig");
const Employee = require("./models/Employees");

// Connect to database
mongoose
  .connect(dbConfig)
  .then(() => console.log("DB Connected for seeding"))
  .catch((error) => console.log(error));

// Sample employee data - 10 users with 2 admins
const sampleEmployees = [
  // Admin 1
  {
    firstName: "Admin",
    lastName: "User",
    employeeId: "QWIT-1001",
    email: "admin@quantumworks.in",
    mobile: "9876543210",
    dateOfBirth: new Date("1990-01-15"),
    joiningDate: new Date("2020-01-01"),
    password: "admin@123",
    profileImage: "",
    department: "IT",
    designation: "Administrator",
    gender: "Male",
    grade: "A1",
    role: "Admin",
    report: "",
    address: "123 Admin Street, Bangalore, Karnataka",
    bankname: "State Bank of India",
    accountnumber: "1234567890123456",
    ifsccode: "SBIN0001234",
    PANno: "ABCDE1234F",
    UANno: "123456789012",
    ESIno: "123456789012345",
    fathername: "Admin Father",
  },
  // Admin 2
  {
    firstName: "HR",
    lastName: "Administrator",
    employeeId: "QWIT-1002",
    email: "hr.admin@quantumworks.in",
    mobile: "9876543211",
    dateOfBirth: new Date("1988-05-20"),
    joiningDate: new Date("2020-02-15"),
    password: "admin@123",
    profileImage: "",
    department: "Human Resources",
    designation: "HR Administrator",
    gender: "Female",
    grade: "A1",
    role: "Admin",
    report: "",
    address: "456 HR Avenue, Bangalore, Karnataka",
    bankname: "HDFC Bank",
    accountnumber: "2345678901234567",
    ifsccode: "HDFC0002345",
    PANno: "FGHIJ5678K",
    UANno: "234567890123",
    ESIno: "234567890123456",
    fathername: "HR Father",
  },
  // Employee 3
  {
    firstName: "John",
    lastName: "Doe",
    employeeId: "QWIT-1003",
    email: "john.doe@quantumworks.in",
    mobile: "9876543212",
    dateOfBirth: new Date("1992-03-10"),
    joiningDate: new Date("2021-06-01"),
    password: "employee@123",
    profileImage: "",
    department: "Engineering",
    designation: "Software Developer",
    gender: "Male",
    grade: "B1",
    role: "Employee",
    report: "QWIT-1001",
    address: "789 Developer Road, Bangalore, Karnataka",
    bankname: "ICICI Bank",
    accountnumber: "3456789012345678",
    ifsccode: "ICIC0003456",
    PANno: "KLMNO9012P",
    UANno: "345678901234",
    ESIno: "345678901234567",
    fathername: "John Father",
  },
  // Employee 4
  {
    firstName: "Jane",
    lastName: "Smith",
    employeeId: "QWIT-1004",
    email: "jane.smith@quantumworks.in",
    mobile: "9876543213",
    dateOfBirth: new Date("1993-07-22"),
    joiningDate: new Date("2021-08-15"),
    password: "employee@123",
    profileImage: "",
    department: "Design",
    designation: "UI/UX Designer",
    gender: "Female",
    grade: "B1",
    role: "Employee",
    report: "QWIT-1002",
    address: "321 Designer Street, Bangalore, Karnataka",
    bankname: "Axis Bank",
    accountnumber: "4567890123456789",
    ifsccode: "UTIB0004567",
    PANno: "PQRST3456U",
    UANno: "456789012345",
    ESIno: "456789012345678",
    fathername: "Jane Father",
  },
  // Employee 5
  {
    firstName: "Michael",
    lastName: "Johnson",
    employeeId: "QWIT-1005",
    email: "michael.johnson@quantumworks.in",
    mobile: "9876543214",
    dateOfBirth: new Date("1991-11-05"),
    joiningDate: new Date("2020-12-01"),
    password: "employee@123",
    profileImage: "",
    department: "Marketing",
    designation: "Marketing Manager",
    gender: "Male",
    grade: "B2",
    role: "Employee",
    report: "QWIT-1001",
    address: "654 Marketing Lane, Bangalore, Karnataka",
    bankname: "Kotak Mahindra Bank",
    accountnumber: "5678901234567890",
    ifsccode: "KKBK0005678",
    PANno: "UVWXY7890Z",
    UANno: "567890123456",
    ESIno: "567890123456789",
    fathername: "Michael Father",
  },
  // Employee 6
  {
    firstName: "Sarah",
    lastName: "Williams",
    employeeId: "QWIT-1006",
    email: "sarah.williams@quantumworks.in",
    mobile: "9876543215",
    dateOfBirth: new Date("1994-02-18"),
    joiningDate: new Date("2022-01-10"),
    password: "employee@123",
    profileImage: "",
    department: "Engineering",
    designation: "Senior Software Developer",
    gender: "Female",
    grade: "B2",
    role: "Employee",
    report: "QWIT-1001",
    address: "987 Tech Park, Bangalore, Karnataka",
    bankname: "Punjab National Bank",
    accountnumber: "6789012345678901",
    ifsccode: "PUNB0006789",
    PANno: "ZABCD2345E",
    UANno: "678901234567",
    ESIno: "678901234567890",
    fathername: "Sarah Father",
  },
  // Employee 7
  {
    firstName: "David",
    lastName: "Brown",
    employeeId: "QWIT-1007",
    email: "david.brown@quantumworks.in",
    mobile: "9876543216",
    dateOfBirth: new Date("1989-09-30"),
    joiningDate: new Date("2020-05-20"),
    password: "employee@123",
    profileImage: "",
    department: "Sales",
    designation: "Sales Manager",
    gender: "Male",
    grade: "B2",
    role: "Employee",
    report: "QWIT-1002",
    address: "147 Sales Avenue, Bangalore, Karnataka",
    bankname: "Bank of Baroda",
    accountnumber: "7890123456789012",
    ifsccode: "BARB0007890",
    PANno: "EFGHI6789J",
    UANno: "789012345678",
    ESIno: "789012345678901",
    fathername: "David Father",
  },
  // Employee 8
  {
    firstName: "Emily",
    lastName: "Davis",
    employeeId: "QWIT-1008",
    email: "emily.davis@quantumworks.in",
    mobile: "9876543217",
    dateOfBirth: new Date("1995-04-25"),
    joiningDate: new Date("2022-03-15"),
    password: "employee@123",
    profileImage: "",
    department: "Design",
    designation: "Graphic Designer",
    gender: "Female",
    grade: "B1",
    role: "Employee",
    report: "QWIT-1002",
    address: "258 Creative Street, Bangalore, Karnataka",
    bankname: "Canara Bank",
    accountnumber: "8901234567890123",
    ifsccode: "CNRB0008901",
    PANno: "JKLMN0123O",
    UANno: "890123456789",
    ESIno: "890123456789012",
    fathername: "Emily Father",
  },
  // Employee 9
  {
    firstName: "Robert",
    lastName: "Wilson",
    employeeId: "QWIT-1009",
    email: "robert.wilson@quantumworks.in",
    mobile: "9876543218",
    dateOfBirth: new Date("1990-08-12"),
    joiningDate: new Date("2021-04-01"),
    password: "employee@123",
    profileImage: "",
    department: "Engineering",
    designation: "DevOps Engineer",
    gender: "Male",
    grade: "B1",
    role: "Employee",
    report: "QWIT-1001",
    address: "369 DevOps Road, Bangalore, Karnataka",
    bankname: "Union Bank of India",
    accountnumber: "9012345678901234",
    ifsccode: "UBIN0009012",
    PANno: "OPQRS4567T",
    UANno: "901234567890",
    ESIno: "901234567890123",
    fathername: "Robert Father",
  },
  // Employee 10
  {
    firstName: "Lisa",
    lastName: "Anderson",
    employeeId: "QWIT-1010",
    email: "lisa.anderson@quantumworks.in",
    mobile: "9876543219",
    dateOfBirth: new Date("1993-12-08"),
    joiningDate: new Date("2022-07-01"),
    password: "employee@123",
    profileImage: "",
    department: "Quality Assurance",
    designation: "QA Engineer",
    gender: "Female",
    grade: "B1",
    role: "Employee",
    report: "QWIT-1001",
    address: "741 QA Boulevard, Bangalore, Karnataka",
    bankname: "Indian Bank",
    accountnumber: "0123456789012345",
    ifsccode: "IDIB0000123",
    PANno: "TUVWX8901Y",
    UANno: "012345678901",
    ESIno: "012345678901234",
    fathername: "Lisa Father",
  },
];

// Function to seed the database
async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing employees (optional - comment out if you want to keep existing data)
    // await Employee.deleteMany({});
    // console.log("Cleared existing employees");

    // Check for existing employees to avoid duplicates
    const existingEmployeeIds = await Employee.find({}, "employeeId");
    const existingIds = new Set(existingEmployeeIds.map((emp) => emp.employeeId));

    let created = 0;
    let skipped = 0;

    for (const employeeData of sampleEmployees) {
      // Skip if employee already exists
      if (existingIds.has(employeeData.employeeId)) {
        console.log(`Skipping ${employeeData.employeeId} - already exists`);
        skipped++;
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(employeeData.password, 10);

      // Normalize email to lowercase for consistency
      const normalizedEmail = employeeData.email.trim().toLowerCase();

      // Create employee with hashed password and normalized email
      const employee = new Employee({
        ...employeeData,
        email: normalizedEmail,
        password: hashedPassword,
      });

      await employee.save();
      console.log(`Created employee: ${employeeData.employeeId} - ${employeeData.firstName} ${employeeData.lastName}`);
      created++;
    }

    console.log(`\nSeeding completed!`);
    console.log(`Created: ${created} employees`);
    console.log(`Skipped: ${skipped} employees (already exist)`);
    console.log(`\nAdmin credentials:`);
    console.log(`Admin 1: admin@quantumworks.in / admin@123`);
    console.log(`Admin 2: hr.admin@quantumworks.in / admin@123`);
    console.log(`Employee default password: employee@123`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

