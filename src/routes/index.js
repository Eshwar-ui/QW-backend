const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const attendanceRoutes = require('./attendance.routes');
const leaveRoutes = require('./leave.routes');
const holidayRoutes = require('./holiday.routes');
const employeeRoutes = require('./employee.routes');
const departmentRoutes = require('./department.routes');
const leaveTypeRoutes = require('./leaveType.routes');
const payslipRoutes = require('./payslip.routes');
const notificationRoutes = require('./notification.routes');
const mobileAccessRoutes = require('./mobileAccess.routes');
const locationRoutes = require('./location.routes');

// Auth Routes
router.use('/auth', authRoutes);

// API Routes
router.use('/api', attendanceRoutes);
router.use('/api', leaveRoutes);
router.use('/api', holidayRoutes);
router.use('/api', employeeRoutes);
router.use('/api', departmentRoutes);
router.use('/api', leaveTypeRoutes);
router.use('/api', payslipRoutes);
router.use('/api', notificationRoutes);
router.use('/api', mobileAccessRoutes);
router.use('/api', locationRoutes);

module.exports = router;
