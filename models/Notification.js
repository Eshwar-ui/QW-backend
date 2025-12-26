const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String,
    required: true,
    index: true, // Index for faster queries
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['leave', 'payslip', 'general', 'system'],
    required: true,
    default: 'general',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedId: {
    type: String,
    default: null, // ID of related entity (leave ID, payslip ID, etc.)
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true, // Index for faster unread queries
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for sorting
  },
  readAt: {
    type: Date,
    default: null,
  },
});

// Compound index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

