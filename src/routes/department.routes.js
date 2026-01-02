const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const middleware = require('../middlewares/jwtAuth.js');

router.post('/department', departmentController.addDepartment); // Legacy had no middleware? Line 1291.
router.get('/getDepartment', departmentController.getDepartments); // Legacy had no middleware? Line 1317.
router.put('/department/:id', middleware, departmentController.updateDepartment);
router.delete('/department/:id', middleware, departmentController.deleteDepartment);

module.exports = router;
