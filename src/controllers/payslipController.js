const Payslips = require("../models/EmployeesPayslips");
const Payslip = require("../models/Payslips");
const Employees = require("../models/Employees");
const Notification = require("../models/Notification");
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const exphbs = require("express-handlebars");
const hbs = exphbs.create({});
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

// Initialize S3 client with credentials if available
const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  maxRetries: 5,
  requestTimeout: 300000,
};

// Add credentials if they are provided in environment variables
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3ClientConfig);

exports.uploadPayslip = async (req, res) => {
  try {
    const { employeeId, month, year, url } = req.body;

    const existingPayslip = await Payslips.findOne({
      employeeId: req.body.employeeId,
      month: req.body.month,
      year: req.body.year,
    });

    if (existingPayslip) {
      return res
        .status(409)
        .json({ error: `Payslip for employee ${employeeId} already exists for ${month}/${year}. Please update the existing payslip instead.` });
    }

    const insertPayslip = Payslips({ employeeId, month, year, url });
    await insertPayslip.save();

    res.status(201).json({ message: "Payslip uploaded successfully" });
  } catch (error) {
    console.error("Error uploading payslip:", error);
    res.status(500).json({ error: "Unable to upload payslip. Please try again later." });
  }
};

exports.deleteEmployeePayslip = async (req, res) => {
  try {
    const { payslipId } = req.params;
    const existingPayslip = await Payslips.findOne({ _id: payslipId });
    if (!existingPayslip) {
      return res.status(404).json({ error: "Payslip not found." });
    }
    await Payslips.findByIdAndDelete(payslipId);
    res.status(200).json({ message: "Payslip deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee payslip:", error);
    res.status(500).json({ error: "Unable to delete payslip. Please try again later." });
  }
};

exports.getEmployeePayslips = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const payslips = await Payslips.find({ employeeId });

    res.json(payslips);
  } catch (error) {
    console.error("Error fetching employee payslips:", error);
    res.status(500).json({ error: "Unable to fetch payslips. Please try again later." });
  }
};

exports.generatePayslip = async (req, res) => {
  try {
    const {
      empId,
      month,
      year,
      basicSalary,
      HRA,
      TA,
      DA,
      conveyanceAllowance,
      total,
      employeesContributionPF,
      // employersContributionPF,
      professionalTAX,
      totalDeductions,
      NetSalary,
      paidDays,
      LOPDays,
      arrear,
    } = req.body;

    // Validate required fields
    if (!empId || !month || !year) {
      return res.status(400).json({ 
        error: "Employee ID, month, and year are required" 
      });
    }

    if (basicSalary === undefined || basicSalary === null) {
      return res.status(400).json({ 
        error: "Basic salary is required" 
      });
    }

    function getMonthName(monthNumber) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return months[monthNumber - 1];
    }
    function formatDate(dateStr) {
      if (!dateStr) return "N/A";
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "N/A";
        const day = String(date.getDate()).padStart(2, "0");
        const monthNumber = String(date.getMonth() + 1).padStart(2, "0");
        const yearStr = date.getFullYear();
        return `${day}-${monthNumber}-${yearStr}`;
      } catch (e) {
        return "N/A";
      }
    }

    const existingPayslip = await Payslip.findOne({ empId, month, year });
    if (existingPayslip) {
      return res.status(409).json({
        error: `Payslip for employee ${empId} already exists for ${month}/${year}. Please update or delete the existing payslip first.`,
      });
    }

    const employee = await Employees.findOne({ employeeId: empId });
    if (!employee) {
      return res.status(404).json({ 
        error: `Employee with ID ${empId} not found` 
      });
    }

    // Data to pass to the HBS template
    const payslipData = {
      month: getMonthName(month),
      year,
      employeeCode: empId,
      name: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "N/A",
      dateOfJoining: formatDate(employee.joiningDate),
      location: employee.address || "N/A",
      department: employee.department || "N/A",
      designation: employee.designation || "N/A",
      grade: employee.grade || "NA",
      bankName: employee.bankname || "NA",
      bankAccountNo: employee.accountnumber || "NA",
      pfNo: employee.pfNo || "NA",
      uan: employee.UANno || "NA",
      pan: employee.PANno || "NA",
      esiNo: employee.ESIno || "NA",
      paidDays,
      lopDays: LOPDays,
      arrearDays: 0, 
      daysInMonth: new Date(year, month, 0).getDate(),
      earnings: [
        {
          type: "Basic Pay",
          master: basicSalary,
          paid: basicSalary,
          arrear: 0,
          ytd: basicSalary * 12,
        },
        {
          type: "House Rent Allow",
          master: HRA,
          paid: HRA,
          arrear: 0,
          ytd: HRA * 12,
        },
        {
          type: "Transport Allowance",
          master: TA,
          paid: TA,
          arrear: 0,
          ytd: TA * 12,
        },
        { type: "DA", master: DA, paid: DA, arrear: 0, ytd: DA * 12 },
        {
          type: "Conveyance Allowance",
          master: conveyanceAllowance,
          paid: conveyanceAllowance,
          arrear: arrear,
          ytd: conveyanceAllowance * 12,
        },
      ],
      totalEarnings: {
        master: total,
        paid: total,
        arrear: arrear,
        ytd: total * 12,
      },
      deductions: [
        {
          type: "Provident Fund",
          deduction: employeesContributionPF,
          arrear: 0,
          ytd: employeesContributionPF * 12,
        },
        {
          type: "Professional Tax",
          deduction: professionalTAX,
          arrear: 0,
          ytd: professionalTAX * 12,
        },
      ],
      totalDeductions: {
        deduction: totalDeductions,
        arrear: 0,
        ytd: totalDeductions * 12,
      },
      netPay: NetSalary,
    };

    const templatePath = path.join(__dirname, "../services/mail/templates/payslip-generation.hbs");
    // WARNING: Code assumes templates are in specific location. Must ensure this file exists.
    // Legacy path was "../src/mail/templates/payslip-generation.hbs" relative to routes/legacyApi.routes.js?
    // legacyApi.routes.js was in src/routes/
    // So ../src/mail/templates/ is src/src/mail/templates?? No.
    // legacyApi.routes.js is in src/routes.
    // original file was in routes/apiRoutes.js.
    // Original path: "../src/mail/templates/payslip-generation.hbs"
    // From routes/apiRoutes.js (root/routes/apiRoutes.js) -> up to root -> src/mail/templates...
    // Now we are in src/controllers/payslipController.js.
    // Up to src -> services -> mail -> templates.
    // So "../services/mail/templates/payslip-generation.hbs". 

    // Check if template file exists
    if (!fs.existsSync(templatePath)) {
      console.error(`Template file not found at: ${templatePath}`);
      return res.status(500).json({ 
        error: "Payslip template file not found. Please contact administrator." 
      });
    }

    let template;
    try {
      template = fs.readFileSync(templatePath, "utf-8");
    } catch (err) {
      console.error("Error reading template file:", err);
      return res.status(500).json({ 
        error: "Error reading payslip template. Please contact administrator." 
      });
    }

    let payslipHtml;
    try {
      const compiledTemplate = hbs.handlebars.compile(template);
      payslipHtml = compiledTemplate(payslipData);
    } catch (err) {
      console.error("Error compiling template:", err);
      return res.status(500).json({ 
        error: "Error compiling payslip template. Please contact administrator." 
      });
    }

    pdf.create(payslipHtml).toBuffer(async (err, buffer) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return res.status(500).json({ error: "Unable to generate payslip PDF. Please try again later." });
      }

      // Check AWS configuration
      if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_REGION) {
        console.error("AWS configuration missing - Bucket:", process.env.AWS_BUCKET_NAME, "Region:", process.env.AWS_REGION);
        return res.status(500).json({ 
          error: "AWS S3 configuration is missing. Please contact administrator." 
        });
      }

      // Check if AWS credentials are available
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error("AWS credentials missing");
        return res.status(500).json({ 
          error: "AWS S3 credentials are not configured. Please contact administrator." 
        });
      }

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `payslips/${empId}_${year}_${month}.pdf`,
        Body: buffer,
        ContentType: "application/pdf",
      };

      let attempts = 0;
      const maxRetries = 5;
      let uploadError = null;
      while (attempts < maxRetries) {
        try {
          const command = new PutObjectCommand(params);
          await s3Client.send(command);
          uploadError = null;
          break; 
        } catch (err) {
          attempts++;
          uploadError = err;
          console.error(`S3 upload attempt ${attempts} failed:`, err.message || err);
          if (attempts >= maxRetries) {
            console.error("Error uploading to S3 after retries:", {
              message: err.message,
              code: err.code,
              name: err.name,
              stack: err.stack,
            });
            
            // Provide more specific error message based on error type
            let errorMessage = "Failed to upload payslip to storage. Please try again later.";
            if (err.code === 'CredentialsError' || err.name === 'CredentialsError') {
              errorMessage = "AWS credentials are invalid or expired. Please contact administrator.";
            } else if (err.code === 'NoSuchBucket') {
              errorMessage = `AWS S3 bucket "${process.env.AWS_BUCKET_NAME}" does not exist. Please contact administrator.`;
            } else if (err.code === 'AccessDenied') {
              errorMessage = "Access denied to AWS S3 bucket. Please check permissions.";
            } else if (err.message) {
              errorMessage = `S3 upload failed: ${err.message}`;
            }
            
            return res.status(500).json({ 
              error: errorMessage 
            });
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      const payslipUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      let newPayslip;
      try {
        newPayslip = new Payslip({ empId, month, year, payslipUrl });
        await newPayslip.save();
      } catch (saveError) {
        console.error("Error saving payslip to database:", saveError);
        return res.status(500).json({ 
          error: "Failed to save payslip. Please try again later." 
        });
      }

      // Get admin ID from request (if middleware is present) or use default
      const adminId = req.employeeId || req.body.adminId || "SYSTEM";
      let adminEmployee;
      let adminName = 'Admin';
      try {
        adminEmployee = await Employees.findOne({ employeeId: adminId });
        if (adminEmployee) {
          adminName = adminEmployee.fullName || 
            `${adminEmployee.firstName || ''} ${adminEmployee.lastName || ''}`.trim() || 'Admin';
        }
      } catch (adminError) {
        console.error("Error fetching admin employee:", adminError);
        // Continue with default admin name
      }

      try {
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const notification = new Notification({
          recipientId: empId,
          senderId: adminId,
          senderName: adminName,
          type: 'payslip',
          title: 'Payslip Generated',
          message: `Your payslip for ${monthNames[month - 1]} ${year} has been generated and is now available.`,
          relatedId: newPayslip._id.toString(),
          isRead: false,
        });
        await notification.save();
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }

      res.status(200).json({
        message: "Payslip generated and saved successfully",
        payslipUrl,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPayslips = async (req, res) => {
  try {
    const { empId, month, year } = req.query;

    const filter = { empId };

    if (month) {
      filter.month = Number(month);
    }

    if (year) {
      filter.year = Number(year);
    }

    const payslips = await Payslip.find(filter);

    res.status(200).json(payslips);
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({ error: "Unable to fetch payslips. Please try again later." });
  }
};

exports.deletePayslip = async (req, res) => {
  try {
    const { payslipId } = req.params;

    const deletedPayslip = await Payslip.findByIdAndDelete({ _id: payslipId });

    if (!deletedPayslip) {
      return res.status(404).json({
        error: "Payslip not found.",
      });
    }

    res.status(200).json({
      message: `Payslip for Employee ID ${deletedPayslip.empId} for ${deletedPayslip.month}/${deletedPayslip.year} deleted successfully.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
