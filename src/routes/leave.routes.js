const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const middleware = require('../middlewares/jwtAuth.js');

router.post('/apply-leave', middleware, leaveController.applyLeave);
router.put('/leave/update-status', middleware, leaveController.updateLeaveStatus);
router.get('/get-leaves/:employeeId', middleware, leaveController.getLeaves);
router.get('/all-leaves', middleware, leaveController.getAllLeaves);
router.get('/get-leave/:employeeId/:leaveId', middleware, leaveController.getLeave);
router.put('/update-leave/:employeeId/:leaveId', middleware, leaveController.updateLeave);
router.delete('/delete-leave/:employeeId/:leaveId', middleware, leaveController.deleteLeave);

module.exports = router;
