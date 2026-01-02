const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employees");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email
    if (!email || email.trim() === "") {
      return res.status(400).json({ error: "Email address is required" });
    }
    
    // Validate password
    if (!password || password.trim() === "") {
      return res.status(400).json({ error: "Password is required" });
    }
    
    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    const exist = await Employee.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } 
    });
    
    if (!exist) {
      console.log(`Login attempt failed: Email not found - ${normalizedEmail}`);
      return res.status(400).json({ error: "Invalid email address or password. Please check your credentials and try again." });
    }
    
    const isPasswordMatched = await bcrypt.compare(password, exist.password);
    
    if (isPasswordMatched) {
      const isQwitAdmin = exist.employeeId === "QWIT-1001";
      const empType = isQwitAdmin ? "Admin" : "Employee";
      
      let payload = {
        employeeId: exist.employeeId,
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET || "jwtPassword", 
        { expiresIn: "24hr" },
        (err, token) => {
          if (err) {
            console.error("JWT signing error:", err);
            return res.status(500).json({ error: "Unable to generate authentication token. Please try again later." });
          }
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
      return res.status(400).json({ error: "Invalid email address or password. Please check your credentials and try again." });
    }
  } catch (err) {
    console.error("Login API error:", err);
    res.status(500).json({ error: "Unable to process login request. Please try again later." });
  }
};
