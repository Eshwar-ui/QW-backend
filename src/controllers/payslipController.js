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

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  maxRetries: 5,
  requestTimeout: 300000, 
});

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

    function getMonthName(monthNumber) {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return months[monthNumber - 1];
    }
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const monthNumber = String(date.getMonth() + 1).padStart(2, "0");
      const yearStr = date.getFullYear();
      return `${day}-${monthNumber}-${yearStr}`;
    }

    const existingPayslip = await Payslip.findOne({ empId, month, year });
    if (existingPayslip) {
      return res.status(409).json({
        error: `Payslip for employee ${empId} already exists for ${month}/${year}. Please update or delete the existing payslip first.`,
      });
    }

    const employee = await Employees.findOne({ employeeId: empId });

    // Data to pass to the HBS template
    const payslipData = {
      month: getMonthName(month),
      year,
      employeeCode: empId,
      name: employee.fullName,
      dateOfJoining: formatDate(employee.joiningDate),
      location: employee.address || "Hyderabad",
      department: employee.department,
      designation: employee.designation,
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

    const template = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = hbs.handlebars.compile(template);
    const payslipHtml = compiledTemplate(payslipData);

    pdf.create(payslipHtml).toBuffer(async (err, buffer) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return res.status(500).json({ error: "Unable to generate payslip PDF. Please try again later." });
      }

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `payslips/${empId}_${year}_${month}.pdf`,
        Body: buffer,
        ContentType: "application/pdf",
      };

      let attempts = 0;
      const maxRetries = 5;
      while (attempts < maxRetries) {
        try {
          const command = new PutObjectCommand(params);
          await s3Client.send(command);
          break; 
        } catch (err) {
          attempts++;
          if (attempts >= maxRetries) throw err;
        }
      }

      const payslipUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      const newPayslip = new Payslip({ empId, month, year, payslipUrl });
      await newPayslip.save();

      const adminId = req.employeeId || "QWIT-1001";
      const adminEmployee = await Employees.findOne({ employeeId: adminId });
      const adminName = adminEmployee 
        ? `${adminEmployee.firstName} ${adminEmployee.lastName}`
        : 'Admin';

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
