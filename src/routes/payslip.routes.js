const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const middleware = require('../middlewares/jwtAuth.js');

router.post('/upload-payslip', payslipController.uploadPayslip); // No middleware in legacy? Line 1082 (1061 was commented out)
router.delete('/delete-employeepayslip/:payslipId', payslipController.deleteEmployeePayslip); // No middleware in legacy? Line 1108
router.get('/employee-payslip/:employeeId', middleware, payslipController.getEmployeePayslips); // Middleware used here (1278)

// Generated Payslips
router.post('/generate-payslip', payslipController.generatePayslip); // No middleware (1469)
router.get('/payslips', payslipController.getPayslips); // No middleware (1689)
router.delete('/delete-payslip/:payslipId', payslipController.deletePayslip); // No middleware (1714)

module.exports = router;
