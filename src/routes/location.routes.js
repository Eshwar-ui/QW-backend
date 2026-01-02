const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const middleware = require('../middlewares/jwtAuth.js');

// Company Locations
router.get('/company-locations', middleware, locationController.getCompanyLocations);
router.post('/company-locations', middleware, locationController.createCompanyLocation);
router.put('/company-locations/:id', middleware, locationController.updateCompanyLocation);
router.delete('/company-locations/:id', middleware, locationController.deleteCompanyLocation);

// Employee Locations
router.get('/employee-locations/:employeeId', middleware, locationController.getEmployeeLocations);
router.post('/employee-locations', middleware, locationController.createEmployeeLocation);
router.put('/employee-locations/:id', middleware, locationController.updateEmployeeLocation);
router.delete('/employee-locations/:id', middleware, locationController.deleteEmployeeLocation);

// Validation
router.post('/validate-location', middleware, locationController.validateLocation);

module.exports = router;
