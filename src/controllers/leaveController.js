const Leave = require("../models/Leaves");
const Employees = require("../models/Employees");
const Notification = require("../models/Notification");
const { sendEmail } = require("../services/mail/emailService");
const { format } = require("date-fns");

exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, from, to, days, reason } = req.body;

    // Validate required fields
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
    if (!leaveType) {
      return res.status(400).json({ error: "Leave type is required" });
    }
    if (!from) {
      return res.status(400).json({ error: "Start date is required" });
    }
    if (!to) {
      return res.status(400).json({ error: "End date is required" });
    }
    if (!days || days <= 0) {
      return res.status(400).json({ error: "Number of days must be greater than zero" });
    }

    // Validate date range
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Please use a valid date." });
    }

    if (toDate < fromDate) {
      return res.status(400).json({ error: "End date cannot be before start date. Please select a valid date range." });
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employeeId,
      status: { $ne: 'Rejected' },
      $or: [
        { from: { $lte: fromDate }, to: { $gte: fromDate } },
        { from: { $lte: toDate }, to: { $gte: toDate } },
        { from: { $gte: fromDate }, to: { $lte: toDate } }
      ]
    });

    if (overlappingLeave) {
      return res.status(409).json({
        error: "You already have a leave request that overlaps with these dates. Please select different dates or cancel the existing request first."
      });
    }

    const newLeave = new Leave({
      employeeId,
      type: leaveType,
      from,
      to,
      days,
      reason,
      status: "New",
      actionBy: "HR",
      action: "-",
    });

    const savedLeave = await newLeave.save();
    
    const reportingUserResult = await Employees.findOne({
      employeeId: newLeave.employeeId,
    });

    let user_name =
      reportingUserResult?.firstName + " " + reportingUserResult?.lastName;

    try {
      const adminId = "QWIT-1001";
      const notification = new Notification({
        recipientId: adminId,
        senderId: employeeId,
        senderName: user_name,
        type: 'leave',
        title: 'New Leave Request',
        message: `${user_name} has applied for ${leaveType} leave from ${format(new Date(from), "dd-MM-yyyy")} to ${format(new Date(to), "dd-MM-yyyy")} (${days} day${days > 1 ? 's' : ''}).`,
        relatedId: savedLeave._id.toString(),
        isRead: false,
      });
      await notification.save();
    } catch (notifError) {
      console.error("Error creating notification for admin:", notifError);
    }

    res.json({ message: "Leave Applied Successfully" });
    
    // Send Email Asynchronously
    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    sendEmail({
        to: "hr@quantumworks.in",
        subject: `Leave applied by ${user_name} - ${employeeId}`,
        templateName: "templates/leave-request.hbs",
        context: {
          leave_title: `Leave applied by ${user_name} - ${employeeId}`,
          admin: "Admin ",
          employee_name: user_name,
          employee_id: employeeId,
          employee_department: reportingUserResult?.department,
          employee_designation: reportingUserResult?.designation,
          from_date: formatDate(newLeave?.from),
          to_date: formatDate(newLeave?.to),
          leave_type: leaveType,
          no_of_days: newLeave?.days,
          request_date: formatDate(new Date()),
          reason: reason,
          company: "Quantum Works Private Limited",
        },
    });

  } catch (error) {
    console.error("Error applying leave:", error);
    res.status(500).json({ error: "Unable to process leave request. Please try again later." });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId, status } = req.body;
    const { employeeId: adminId } = req; // From Middleware

    if (!leaveId) {
      return res.status(400).json({ error: "Leave ID is required" });
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ['Approved', 'Rejected', 'New'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const leaveToUpdate = await Leave.findById(leaveId);
    if (!leaveToUpdate) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    );
    
    const adminEmployee = await Employees.findOne({ employeeId: adminId });
    const adminName = adminEmployee 
      ? `${adminEmployee.firstName} ${adminEmployee.lastName}`
      : 'Admin';

    try {
      const notification = new Notification({
        recipientId: updatedLeave.employeeId,
        senderId: adminId,
        senderName: adminName,
        type: 'leave',
        title: `Leave Request ${status}`,
        message: `Your leave request (${updatedLeave.type}) from ${format(new Date(updatedLeave.from), "dd-MM-yyyy")} to ${format(new Date(updatedLeave.to), "dd-MM-yyyy")} has been ${status.toLowerCase()}.`,
        relatedId: leaveId,
        isRead: false,
      });
      await notification.save();
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    res.json({ message: `Leave ${updatedLeave.status}` });

    // Send Email
    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const reportingUserResult = await Employees.findOne({
        employeeId: updatedLeave.employeeId,
    });

    let user_name = reportingUserResult?.firstName + " " + reportingUserResult?.lastName;
    
    sendEmail({
        to: reportingUserResult?.email,
        subject: `Leave ${status}`,
        templateName: "templates/leave-action.hbs",
        context: {
          leave_title: "Leave Request Updated",
          user_name: user_name,
          leave_type: updatedLeave?.type,
          from_date: formatDate(updatedLeave?.from),
          to_date: formatDate(updatedLeave?.to),
          no_of_days: updatedLeave?.days,
          action_class: `action-${status.toLowerCase()}`,
          action_text: status,
          current_date: formatDate(new Date()),
          company: "Quantum Works Private Limited",
        },
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ error: "Unable to update leave status. Please try again later." });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaves = await Leave.find({ employeeId });
    const formattedLeaves = leaves.map((leave) => ({
      _id: leave._id,
      type: leave.type,
      from: format(new Date(leave.from), "dd-MM-yyyy"),
      to: format(new Date(leave.to), "dd-MM-yyyy"),
      days: leave.days,
      reason: leave.reason,
      status: leave.status,
      actionBy: leave.actionBy,
      action: leave.action,
    }));

    res.json(formattedLeaves);
  } catch (error) {
    console.error("Error fetching employee leaves:", error);
    res.status(500).json({ error: "Unable to fetch leave records. Please try again later." });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const allLeaves = await Leave.find({}).sort({ _id: -1 });
    const formattedLeaves = await Promise.all(
      allLeaves.map(async (leave) => {
        const employeeDetails = await Employees.findOne({
          employeeId: leave.employeeId,
        });

        return {
          id: leave._id,
          type: leave.type,
          employeeId: leave.employeeId,
          from: format(new Date(leave.from), "dd-MM-yyyy"),
          to: format(new Date(leave.to), "dd-MM-yyyy"),
          days: leave.days,
          reason: leave.reason,
          status: leave.status,
          actionBy: leave.actionBy,
          action: leave.action,
          employeeName: employeeDetails
            ? `${employeeDetails.firstName} ${employeeDetails.lastName}`
            : "",
        };
      })
    );

    res.json(formattedLeaves);
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ error: "Unable to fetch leave records. Please try again later." });
  }
};

exports.updateLeave = async (req, res) => {
  try {
    const { employeeId, leaveId } = req.params;

    const leaveToUpdate = await Leave.findOne({ _id: leaveId, employeeId });

    if (!leaveToUpdate) {
      return res
        .status(404)
        .json({ error: `Leave request not found for employee ${employeeId}` });
    }

    await Leave.findByIdAndUpdate(
      leaveId,
      {
        type: req.body.data?.leaveType,
        from: req.body.data?.from,
        to: req.body.data?.to,
        days: req.body.data?.days,
        reason: req.body.data?.reason,
      },
      { new: true }
    );

    res.json({ message: "Leave updated successfully" });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ error: "Unable to update leave request. Please try again later." });
  }
};

exports.getLeave = async (req, res) => {
  try {
    const { employeeId, leaveId } = req.params;
    const leaveDetails = await Leave.findOne({ _id: leaveId, employeeId });

    if (!leaveDetails) {
      return res
        .status(404)
        .json({ error: `Leave request not found for employee ${employeeId}` });
    }

    res.json(leaveDetails);
  } catch (error) {
    console.error("Error fetching individual leave details:", error);
    res.status(500).json({ error: "Unable to fetch leave details. Please try again later." });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const { employeeId, leaveId } = req.params;

    const leaveToDelete = await Leave.findOne({ _id: leaveId, employeeId });

    if (!leaveToDelete) {
      return res
        .status(404)
        .json({ error: `Leave request not found for employee ${employeeId}` });
    }

    const deletedLeave = await Leave.findByIdAndDelete(leaveId);

    res.json({ message: "Leave deleted successfully", leave: deletedLeave });
  } catch (error) {
    console.error("Error deleting leave:", error);
    res.status(500).json({ error: "Unable to delete leave request. Please try again later." });
  }
};
