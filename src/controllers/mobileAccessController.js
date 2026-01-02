const Employees = require("../models/Employees");

exports.getMobileAccessStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employees.findOne({ employeeId });
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.status(200).json({ 
      employeeId,
      mobileAccessEnabled: employee.mobileAccessEnabled || false 
    });
  } catch (error) {
    console.error("Error fetching mobile access status:", error);
    res.status(500).json({ error: "Unable to fetch mobile access status. Please try again later." });
  }
};

exports.toggleMobileAccess = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: "The 'enabled' field must be a boolean value (true or false)." });
    }
    
    const employee = await Employees.findOneAndUpdate(
      { employeeId },
      { mobileAccessEnabled: enabled },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.status(200).json({ 
      message: `Mobile access ${enabled ? 'enabled' : 'disabled'} successfully`,
      employeeId,
      mobileAccessEnabled: employee.mobileAccessEnabled 
    });
  } catch (error) {
    console.error("Error updating mobile access:", error);
    res.status(500).json({ error: "Unable to update mobile access status. Please try again later." });
  }
};

exports.getAllMobileAccessStatus = async (req, res) => {
  try {
    const employees = await Employees.find({}, 'employeeId firstName lastName email mobileAccessEnabled');
    
    res.status(200).json(
      employees.map(emp => ({
        employeeId: emp.employeeId,
        fullName: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        mobileAccessEnabled: emp.mobileAccessEnabled || false
      }))
    );
  } catch (error) {
    console.error("Error fetching all mobile access status:", error);
    res.status(500).json({ error: "Unable to fetch mobile access statuses. Please try again later." });
  }
};
