const express = require('express');
const router = express.Router();
const leaveTypeController = require('../controllers/leaveTypeController');
const middleware = require('../middlewares/jwtAuth.js');

router.post('/leaveType', leaveTypeController.addLeaveType); // Legacy had no middleware? Line 1383.
router.get('/getLeavetype', leaveTypeController.getLeaveTypes); // Legacy had no middleware? Line 1406.
router.put('/leaveType/:id', middleware, leaveTypeController.updateLeaveType);
router.delete('/leaveType/:id', middleware, leaveTypeController.deleteLeaveType);

module.exports = router;
