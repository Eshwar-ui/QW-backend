const LeaveType = require("../models/LeaveType");

exports.addLeaveType = async (req, res) => {
  try {
    const { leaveType } = req.body;

    const existingLeaveType = await LeaveType.findOne({ leaveType });

    if (!leaveType || leaveType.trim() === "") {
      return res.status(400).json({ error: "Leave type name is required" });
    }

    if (existingLeaveType) {
      return res
        .status(409)
        .json({ error: `Leave type "${leaveType}" already exists. Please use a different name.` });
    }
    const newLeaveType = new LeaveType({ leaveType });
    await newLeaveType.save();

    res.status(201).json({ message: "LeaveType added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getLeaveTypes = async (req, res) => {
  try {
    const leavetypes = await LeaveType.find();
    res.status(200).json(leavetypes);
  } catch (error) {
    console.error("Error fetching leave types:", error);
    res.status(500).json({ error: "Unable to fetch leave types. Please try again later." });
  }
};

exports.updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveType } = req.body;

    const existingLeaveType = await LeaveType.findById(id);
    if (!existingLeaveType) {
      return res.status(404).json({ error: "Leave type not found." });
    }

    if (!leaveType || leaveType.trim() === "") {
      return res.status(400).json({ error: "Leave type name is required" });
    }

    const duplicateLeaveType = await LeaveType.findOne({
      leaveType,
      _id: { $ne: id },
    });

    if (duplicateLeaveType) {
      return res
        .status(409)
        .json({ error: `Leave type "${leaveType}" already exists. Please use a different name.` });
    }

    existingLeaveType.leaveType = leaveType;
    await existingLeaveType.save();

    res.status(200).json({ message: "Leave type updated successfully" });
  } catch (error) {
    console.error("Error updating leave type:", error);
    res.status(500).json({ error: "Unable to update leave type. Please try again later." });
  }
};

exports.deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLeaveType = await LeaveType.findById(id);
    if (!existingLeaveType) {
      return res.status(404).json({ error: "Leave type not found." });
    }

    await LeaveType.findByIdAndDelete(id);

    res.status(200).json({ message: "Leave type deleted successfully" });
  } catch (error) {
    console.error("Error deleting leave type:", error);
    res.status(500).json({ error: "Unable to delete leave type. Please try again later." });
  }
};
