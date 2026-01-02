const Notification = require("../models/Notification");

exports.createNotification = async (req, res) => {
  try {
    const { recipientId, senderId, senderName, type, title, message, relatedId } = req.body;

    const missingFields = [];
    if (!recipientId) missingFields.push("recipientId");
    if (!senderId) missingFields.push("senderId");
    if (!title) missingFields.push("title");
    if (!message) missingFields.push("message");
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(", ")}. Please provide all required information.` 
      });
    }

    const validTypes = ['leave', 'payslip', 'general', 'system'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid notification type. Must be one of: ${validTypes.join(", ")}` 
      });
    }

    const notification = new Notification({
      recipientId,
      senderId,
      senderName: senderName || 'System',
      type: type || 'general',
      title,
      message,
      relatedId: relatedId || null,
      isRead: false,
    });

    await notification.save();
    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Unable to create notification. Please try again later." });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { employeeId } = req;
    const { unreadOnly, type, limit } = req.query;

    const query = { recipientId: employeeId };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    if (type && ['leave', 'payslip', 'general', 'system'].includes(type)) {
      query.type = type;
    }

    const options = {
      sort: { createdAt: -1 },
    };
    
    if (limit) {
      options.limit = parseInt(limit);
    }

    const notifications = await Notification.find(query, null, options);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Unable to fetch notifications. Please try again later." });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { employeeId } = req;

    const count = await Notification.countDocuments({ 
      recipientId: employeeId, 
      isRead: false 
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Unable to fetch unread notification count. Please try again later." });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { employeeId } = req;

    const result = await Notification.updateMany(
      { recipientId: employeeId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ 
      message: "All notifications marked as read", 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Unable to mark notifications as read. Please try again later." });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req;

    const notification = await Notification.findOne({ _id: id, recipientId: employeeId });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ error: "Unable to fetch notification. Please try again later." });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: employeeId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Unable to mark notification as read. Please try again later." });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req;

    const notification = await Notification.findOneAndDelete({ 
      _id: id, 
      recipientId: employeeId 
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Unable to delete notification. Please try again later." });
  }
};
