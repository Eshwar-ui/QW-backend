const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const middleware = require('../middlewares/jwtAuth.js');

router.post('/add-holiday', middleware, holidayController.addHoliday);
router.get('/get-holidays', middleware, holidayController.getHolidays);
router.put('/update-holiday/:id', middleware, holidayController.updateHoliday);
router.delete('/delete-holiday/:id', middleware, holidayController.deleteHoliday);

module.exports = router;
