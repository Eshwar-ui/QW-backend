const mongoose = require('mongoose');

const companyLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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

companyLocationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const CompanyLocation = mongoose.model('CompanyLocation', companyLocationSchema);

module.exports = CompanyLocation;

