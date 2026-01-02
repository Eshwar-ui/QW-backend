const Employees = require("../models/Employees");
const Leave = require("../models/Leaves");
const Attendance = require("../models/Attendance");
const Payslips = require("../models/EmployeesPayslips");
const EmployeeLocation = require("../models/EmployeeLocation");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../services/mail/emailService");

exports.addEmployee = async (req, res) => {
  try {
    const existingEmployee = await Employees.findOne({
      $or: [{ employeeId: req.body.employeeId }, { email: req.body.email }],
    });

    if (existingEmployee) {
      if (existingEmployee.employeeId === req.body.employeeId) {
        return res.status(409).json({ error: `Employee ID ${req.body.employeeId} already exists. Please use a different employee ID.` });
      }
      if (existingEmployee.email === req.body.email) {
        return res.status(409).json({ error: `Email address ${req.body.email} is already registered. Please use a different email address.` });
      }
    }

    req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let password = req.body.password;
    req.body.password = hashedPassword;

    const newEmployee = new Employees(req.body);
    await newEmployee.save();

    res.status(201).json({ message: "Employee added successfully" });
    
    // Send email asynchronously
    try {
        sendEmail({
            to: req.body.email,
            subject: "Login credentials",
            templateName: "templates/user-created.hbs",
            context: {
              first_name: req.body.firstName,
              last_name: req.body.lastName,
              office_email: req.body.email,
              generatedPassword: password,
              loginLink: `https://quantumworks.space`,
              company: "Quantum Works Private Limited",
            },
        });
    } catch (mailError) {
        console.error("Error sending email:", mailError);
    }

  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ error: "Unable to add employee. Please try again later." });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const { employeeId, employeeName, designation } = req.query;

    const filter = {};
    if (employeeId) {
      filter.employeeId = employeeId;
    }
    if (employeeName) {
      filter.$or = [
        { firstName: { $regex: new RegExp(employeeName, "i") } },
        { lastName: { $regex: new RegExp(employeeName, "i") } },
      ];
    }
    if (designation) {
      filter.designation = designation;
    }

    const employees = await Employees.find(filter).select("-password");
    if (employees.length === 0) {
      return res.status(404).json({ error: "No employees found matching your search criteria." });
    }
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Unable to fetch employee list. Please try again later." });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employees.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: `Employee with ID ${employeeId} not found.` });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Unable to fetch employee details. Please try again later." });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const id = req.params.id;

    const existingEmployee = await Employees.findOne({ _id: id });

    if (!existingEmployee) {
      return res.status(404).json({ error: `Employee not found.` });
    }

    if (req.body.email && req.body.email !== existingEmployee.email) {
      const emailExists = await Employees.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(409).json({ error: `Email address ${req.body.email} is already registered. Please use a different email address.` });
      }
    }

    // Update fields
    const fieldsToUpdate = [
        "firstName", "lastName", "email", "employeeId", "mobile", 
        "dateOfBirth", "joiningDate", "designation", "gender", "role", 
        "profileImage", "bankname", "department", "grade", "report", 
        "address", "accountnumber", "ifsccode", "PANno", "UANno", 
        "ESIno", "fathername"
    ];

    fieldsToUpdate.forEach(field => {
        if (req.body[field] !== undefined) {
            existingEmployee[field] = req.body[field];
        }
    });

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      existingEmployee.password = hashedPassword;
    }

    await existingEmployee.save();

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Unable to update employee details. Please try again later." });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employees.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: `Employee with ID ${employeeId} not found.` });
    }

    await Leave.deleteMany({ employeeId });
    await Attendance.deleteMany({ employeeId });
    await Payslips.deleteMany({ employeeId });
    await EmployeeLocation.deleteMany({ employeeId });
    await Notification.deleteMany({ 
      $or: [
        { recipientId: employeeId },
        { senderId: employeeId }
      ]
    });

    await Employees.findOneAndDelete({ employeeId });

    res.json({ message: "Employee and all related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Unable to delete employee. Please try again later." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employees.findOne({ employeeId: employeeId });

    if (!employee) {
      return res.status(404).json({ error: `Employee with ID ${employeeId} not found.` });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.trim() === "") {
      return res.status(400).json({ error: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match. Please ensure both fields have the same value." });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    
    await Employees.findOneAndUpdate(
      { employeeId: employeeId },
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ error: "Unable to update password. Please try again later." });
  }
};
