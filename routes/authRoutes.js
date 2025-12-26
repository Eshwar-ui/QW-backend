const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const Employee = require("../models/Employees");


const router = express.Router();


// login API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    // Normalize email: trim whitespace and convert to lowercase for comparison
    const normalizedEmail = email.trim().toLowerCase();
    // Use case-insensitive email search to handle any case variations in database
    const exist = await Employee.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    if (!exist) {
      console.log(`Login attempt failed: Email not found - ${normalizedEmail}`);
      return res.status(400).json({ message: "Invalid Email ID" });
    }
    const isPasswordMatched = await bcrypt.compare(password, exist.password);
    if (isPasswordMatched) {

      if (exist.employeeId === "QWIT-1001") {
        const empType = "Admin";
        let payload = {
          employeeId: exist.employeeId,
        };
        jwt.sign(
          payload,
          "jwtPassword",
          { expiresIn: "24hr" },
          (err, token) => {
            if (err) throw err;
            return res.json({ 
              token, 
              payload, 
              empType, 
              fullName: `${exist.firstName} ${exist.lastName}`,
              mobileAccessEnabled: exist.mobileAccessEnabled || false
            });
          }
        );
      } else {
        const empType = "Employee";

        let payload = {
          employeeId: exist.employeeId,
        };
        jwt.sign(
          payload,
          "jwtPassword",
          { expiresIn: "24hr" },
          (err, token) => {
            if (err) throw err;
            return res.json({ 
              token, 
              payload, 
              empType, 
              fullName: `${exist.firstName} ${exist.lastName}`,
              mobileAccessEnabled: exist.mobileAccessEnabled || false
            });
          }
        );
      }
    } else {
      return res.status(400).json({ message: "Invalid Password" });
    }
  } catch (err) {
    console.log(err.message, "Login Api");
    res.status(500).send({ data: "Server Error" });
  }
});



module.exports = router;




