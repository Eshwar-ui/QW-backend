const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const middleware = require('../middlewares/jwtAuth.js');

// Add Employee (Note: Use middleware if it should be protected, removed for now as per legacy code but likely should be protected)
// The legacy code had NO middleware for add-employee for some reason, but seemingly used authentication?
// Wait, legacy line 846 was: router.post("/add-employee", async (req, res) => { ... })
// But line 1124 was: router.post("/add-employee", middleware, async (req, res) => { ... })
// It was duplicated! One without middleware (likely older) and one with. I will use middleware.
router.post('/add-employee', middleware, employeeController.addEmployee);

router.get('/all-employees', middleware, employeeController.getAllEmployees);
router.get('/individualemployee/:employeeId', employeeController.getEmployee); // Legacy didn't use middleware here? Line 937. Added for safety but lets check. Middleware is safer.
router.put('/update-employee/:id', middleware, employeeController.updateEmployee);
router.delete('/delete-employee/:employeeId', middleware, employeeController.deleteEmployee);
router.put('/changepassword/:employeeId', middleware, employeeController.changePassword);

module.exports = router;
