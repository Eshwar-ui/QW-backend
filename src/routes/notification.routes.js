const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const middleware = require('../middlewares/jwtAuth.js');

router.post('/notifications', middleware, notificationController.createNotification);
router.get('/notifications', middleware, notificationController.getNotifications);
router.get('/notifications/unread-count', middleware, notificationController.getUnreadCount);
router.put('/notifications/read-all', middleware, notificationController.markAllAsRead);
router.get('/notifications/:id', middleware, notificationController.getNotification);
router.put('/notifications/:id/read', middleware, notificationController.markNotificationAsRead);
router.delete('/notifications/:id', middleware, notificationController.deleteNotification);

module.exports = router;
