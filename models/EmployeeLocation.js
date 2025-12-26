const mongoose = require('mongoose');

const employeeLocationSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee',
  },
  name: {
    type: String,
    required: true, // e.g., "Home", "Alternate Location"
  },
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

employeeLocationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const EmployeeLocation = mongoose.model('EmployeeLocation', employeeLocationSchema);

module.exports = EmployeeLocation;

