const Department = require("../models/Department");

exports.addDepartment = async (req, res) => {
  try {
    const { department, designation } = req.body;

    const existingDepartment = await Department.findOne({
      department,
      designation,
    });

    if (!department || department.trim() === "") {
      return res.status(400).json({ error: "Department name is required" });
    }
    if (!designation || designation.trim() === "") {
      return res.status(400).json({ error: "Designation is required" });
    }

    if (existingDepartment) {
      return res
        .status(409)
        .json({ error: `Department "${department}" with designation "${designation}" already exists. Please use a different combination.` });
    }
    const newDepartment = new Department({ department, designation });
    await newDepartment.save();

    res.status(201).json({ message: "Department added successfully" });
  } catch (error) {
    console.error("Error adding department:", error);
    res.status(500).json({ error: "Unable to add department. Please try again later." });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Unable to fetch departments. Please try again later." });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, designation } = req.body;

    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return res.status(404).json({ error: "Department not found." });
    }

    if (!department || department.trim() === "") {
      return res.status(400).json({ error: "Department name is required" });
    }
    if (!designation || designation.trim() === "") {
      return res.status(400).json({ error: "Designation is required" });
    }

    const duplicateDepartment = await Department.findOne({
      department,
      designation,
      _id: { $ne: id },
    });

    if (duplicateDepartment) {
      return res
        .status(409)
        .json({ error: `Department "${department}" with designation "${designation}" already exists. Please use a different combination.` });
    }

    existingDepartment.department = department;
    existingDepartment.designation = designation;
    await existingDepartment.save();

    res.status(200).json({ message: "Department updated successfully" });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Unable to update department. Please try again later." });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDepartment = await Department.findById(id);
    if (!existingDepartment) {
      return res.status(404).json({ error: "Department not found." });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Unable to delete department. Please try again later." });
  }
};
