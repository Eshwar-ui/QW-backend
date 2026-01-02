const express = require('express');
const router = express.Router();
const mobileAccessController = require('../controllers/mobileAccessController');
const middleware = require('../middlewares/jwtAuth.js');

router.get('/mobile-access/:employeeId', middleware, mobileAccessController.getMobileAccessStatus);
router.put('/mobile-access/:employeeId', middleware, mobileAccessController.toggleMobileAccess);
router.get('/mobile-access', middleware, mobileAccessController.getAllMobileAccessStatus);

module.exports = router;
