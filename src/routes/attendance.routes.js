const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const middleware = require('../middlewares/jwtAuth.js');

// Attendance routes
router.post('/punchin', middleware, attendanceController.punchIn);
router.post('/punchout', middleware, attendanceController.punchOut);
router.get('/punches/:employeeId', middleware, attendanceController.getPunches);
router.get('/date-wise-data/:employeeId', middleware, attendanceController.getDateWiseData);

// Admin specific attendance routes
router.get('/admin/employee/date-punches/:employeeId/:date', middleware, attendanceController.getAdminEmployeeDatePunches);
router.get('/admin/attendance', middleware, attendanceController.getAdminAttendance);

module.exports = router;
