const CompanyLocation = require("../models/CompanyLocation");
const EmployeeLocation = require("../models/EmployeeLocation");
const Employees = require("../models/Employees");

// Company Locations
exports.getCompanyLocations = async (req, res) => {
  try {
    const locations = await CompanyLocation.find().sort({ createdAt: -1 });
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching company locations:", error);
    res.status(500).json({ error: "Unable to fetch company locations. Please try again later." });
  }
};

exports.createCompanyLocation = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    
    const missingFields = [];
    if (!name || name.trim() === "") missingFields.push("name");
    if (!address || address.trim() === "") missingFields.push("address");
    if (latitude === undefined || latitude === null) missingFields.push("latitude");
    if (longitude === undefined || longitude === null) missingFields.push("longitude");
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(", ")}. Please provide all required information.` 
      });
    }
    
    const newLocation = new CompanyLocation({
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });
    
    await newLocation.save();
    res.status(201).json({ message: "Company location created successfully", location: newLocation });
  } catch (error) {
    console.error("Error creating company location:", error);
    res.status(500).json({ error: "Unable to create company location. Please try again later." });
  }
};

exports.updateCompanyLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    
    const updatedLocation = await CompanyLocation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedLocation) {
      return res.status(404).json({ error: "Company location not found." });
    }
    
    res.status(200).json({ message: "Company location updated successfully", location: updatedLocation });
  } catch (error) {
    console.error("Error updating company location:", error);
    res.status(500).json({ error: "Unable to update company location. Please try again later." });
  }
};

exports.deleteCompanyLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLocation = await CompanyLocation.findByIdAndDelete(id);
    
    if (!deletedLocation) {
      return res.status(404).json({ error: "Company location not found." });
    }
    
    res.status(200).json({ message: "Company location deleted successfully" });
  } catch (error) {
    console.error("Error deleting company location:", error);
    res.status(500).json({ error: "Unable to delete company location. Please try again later." });
  }
};

// Employee Locations
exports.getEmployeeLocations = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const locations = await EmployeeLocation.find({ employeeId }).sort({ createdAt: -1 });
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching employee locations:", error);
    res.status(500).json({ error: "Unable to fetch employee locations. Please try again later." });
  }
};

exports.createEmployeeLocation = async (req, res) => {
  try {
    const { employeeId, name, address, latitude, longitude } = req.body;
    
    const missingFields = [];
    if (!employeeId || employeeId.trim() === "") missingFields.push("employeeId");
    if (!name || name.trim() === "") missingFields.push("name");
    if (!address || address.trim() === "") missingFields.push("address");
    if (latitude === undefined || latitude === null) missingFields.push("latitude");
    if (longitude === undefined || longitude === null) missingFields.push("longitude");
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(", ")}. Please provide all required information.` 
      });
    }
    
    const employee = await Employees.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ error: `Employee with ID ${employeeId} not found.` });
    }
    
    const newLocation = new EmployeeLocation({
      employeeId,
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    });
    
    await newLocation.save();
    res.status(201).json({ message: "Employee location created successfully", location: newLocation });
  } catch (error) {
    console.error("Error creating employee location:", error);
    res.status(500).json({ error: "Unable to create employee location. Please try again later." });
  }
};

exports.updateEmployeeLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    
    const updatedLocation = await EmployeeLocation.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedLocation) {
      return res.status(404).json({ error: "Employee location not found." });
    }
    
    res.status(200).json({ message: "Employee location updated successfully", location: updatedLocation });
  } catch (error) {
    console.error("Error updating employee location:", error);
    res.status(500).json({ error: "Unable to update employee location. Please try again later." });
  }
};

exports.deleteEmployeeLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLocation = await EmployeeLocation.findByIdAndDelete(id);
    
    if (!deletedLocation) {
      return res.status(404).json({ error: "Employee location not found." });
    }
    
    res.status(200).json({ message: "Employee location deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee location:", error);
    res.status(500).json({ error: "Unable to delete employee location. Please try again later." });
  }
};

// Validation
exports.validateLocation = async (req, res) => {
  try {
    const { latitude, longitude, employeeId } = req.body;
    
    const missingFields = [];
    if (latitude === undefined || latitude === null) missingFields.push("latitude");
    if (longitude === undefined || longitude === null) missingFields.push("longitude");
    if (!employeeId || employeeId.trim() === "") missingFields.push("employeeId");
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(", ")}. Please provide all required information.` 
      });
    }
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const ALLOWED_RADIUS_METERS = 100;
    
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth's radius in meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    // Check company locations
    const companyLocations = await CompanyLocation.find();
    for (const location of companyLocations) {
      const distance = calculateDistance(lat, lon, location.latitude, location.longitude);
      if (distance <= ALLOWED_RADIUS_METERS) {
        return res.status(200).json({ 
          valid: true, 
          message: "Location validated successfully",
          locationType: "company",
          locationName: location.name,
          distance: Math.round(distance)
        });
      }
    }
    
    // Check employee's individual locations
    const employeeLocations = await EmployeeLocation.find({ employeeId });
    for (const location of employeeLocations) {
      const distance = calculateDistance(lat, lon, location.latitude, location.longitude);
      if (distance <= ALLOWED_RADIUS_METERS) {
        return res.status(200).json({ 
          valid: true, 
          message: "Location validated successfully",
          locationType: "employee",
          locationName: location.name,
          distance: Math.round(distance)
        });
      }
    }
    
    res.status(200).json({ 
      valid: false, 
      message: "You are not at a valid office location to punch in or out.",
      nearestCompanyLocation: companyLocations.length > 0 ? {
        name: companyLocations[0].name,
        distance: Math.round(calculateDistance(lat, lon, companyLocations[0].latitude, companyLocations[0].longitude))
      } : null
    });
  } catch (error) {
    console.error("Error validating location:", error);
    res.status(500).json({ error: "Unable to validate location. Please try again later." });
  }
};
