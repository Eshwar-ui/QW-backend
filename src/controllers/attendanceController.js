const Attendance = require("../models/Attendance");
const Employees = require("../models/Employees");
const { format } = require("date-fns");

exports.punchIn = async (req, res) => {
  const { employeeId, employeeName } = req.body;

  try {
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
    const latestRecord = await Attendance.findOne({ employeeId }).sort({
      punchOut: -1,
    });

    const newRecord = new Attendance({
      employeeId,
      punchIn: new Date(),
      lastPunchType: "PunchIn",
      employeeName: employeeName,
    });

    if (latestRecord && latestRecord.punchOut) {
      const isSameDate =
        newRecord.punchIn.toDateString() ===
        latestRecord.punchOut.toDateString();

      if (isSameDate) {
        newRecord.breakTime =
          (newRecord.punchIn - latestRecord.punchOut) / 1000;
      } else {
        newRecord.breakTime = 0;
      }
    } else {
      newRecord.breakTime = 0;
    }

    await newRecord.save();
    res.json({ message: "Punch in recorded successfully" });
  } catch (error) {
    console.error("Error punching in:", error);
    res.status(500).json({ error: "Unable to record punch in. Please try again later." });
  }
};

exports.punchOut = async (req, res) => {
  const { employeeId, employeeName } = req.body;
  try {
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }
    const latestRecord = await Attendance.findOne({ employeeId }).sort({
      punchIn: -1,
    });

    if (!latestRecord || latestRecord.punchOut) {
      return res
        .status(400)
        .json({ error: "You must punch in before you can punch out. Please punch in first." });
    }

    latestRecord.punchOut = new Date();
    latestRecord.employeeName = employeeName;
    latestRecord.lastPunchedOut = latestRecord.punchOut;
    latestRecord.lastPunchType = "PunchOut";

    const diffTime = latestRecord.punchOut - latestRecord.punchIn;
    const workingTime = diffTime / 1000; // in seconds

    if (!isNaN(workingTime) && isFinite(workingTime)) {
      latestRecord.totalWorkingTime =
        (latestRecord.totalWorkingTime || 0) + workingTime;

      await latestRecord.save();

      res.json({ message: "Punch out recorded successfully" });
    } else {
      res.status(500).json({ error: "Unable to calculate working time. Please contact support if this issue persists." });
    }
  } catch (error) {
    console.error("Error punching out:", error);
    res.status(500).json({ error: "Unable to record punch out. Please try again later." });
  }
};

exports.getPunches = async (req, res) => {
  const employeeId = req.params.employeeId;
  const { fromDate, month, year } = req.query;

  try {
    const filter = { employeeId };
    if (fromDate) {
      filter.punchIn = {
        $gte: new Date(fromDate),
        $lt: new Date(fromDate + "T23:59:59.999Z"),
      };
    }
    if (month) {
      filter.punchIn = {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month, 10) + 1}-01`),
      };
    }
    if (year) {
      filter.punchIn = {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year, 10) + 1}-01-01`),
      };
    }

    const allRecords = await Attendance.find(filter);

    const today = new Date().toLocaleDateString();
    const todayRecords = allRecords.filter(
      (record) => new Date(record.punchIn).toLocaleDateString() === today
    );

    const totalWorkingTime = todayRecords.reduce(
      (acc, record) => acc + (record.totalWorkingTime || 0),
      0
    );

    const formattedRecords = todayRecords.map((record) => ({
      ...record.toObject(),
      lastPunchType: record.lastPunchType,
    }));

    res.json({ punches: formattedRecords, totalWorkingTime });
  } catch (error) {
    console.error("Error fetching punches:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAdminEmployeeDatePunches = async (req, res) => {
  const { employeeId, date } = req.params;

  try {
    const filter = { employeeId };

    if (date) {
      filter.punchIn = {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      };
    }

    const allRecords = await Attendance.find(filter);

    const dateRecords = allRecords.filter(
      (record) =>
        new Date(record.punchIn).toLocaleDateString() ===
        new Date(date).toLocaleDateString()
    );

    const totalWorkingTime = dateRecords.reduce(
      (acc, record) => acc + (record.totalWorkingTime || 0),
      0
    );

    const formattedRecords = dateRecords.map((record) => ({
      ...record.toObject(),
      lastPunchType: record.lastPunchType,
    }));

    res.json({ punches: formattedRecords, totalWorkingTime });
  } catch (error) {
    console.error("Error fetching punches:", error);
    res.status(500).json({ error: "Unable to fetch attendance records. Please try again later." });
  }
};

exports.getDateWiseData = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const { month, year, employeeName } = req.query;

    const matchStage = { $match: { employeeId: employeeId } };

    const filterByMonthYear = [];
    if (month) {
      filterByMonthYear.push({
        $expr: { $eq: [{ $month: "$punchIn" }, parseInt(month)] },
      });
    }
    if (year) {
      filterByMonthYear.push({
        $expr: { $eq: [{ $year: "$punchIn" }, parseInt(year)] },
      });
    }

    let employeeFilterStage = {};
    if (employeeName) {
      const employee = await Employees.findOne({ name: employeeName });
      if (employee) {
        employeeFilterStage = { $match: { employeeId: employee._id } };
      }
    }

    const dateWiseData = await Attendance.aggregate([
      {
        $match: {
          $and: [
            { employeeId: employeeId },
            ...filterByMonthYear,
            employeeFilterStage,
          ],
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$punchIn" } },
          firstPunchIn: { $min: "$punchIn" },
          lastPunchOut: { $max: "$punchOut" },
          totalWorkingTime: { $sum: "$totalWorkingTime" },
          totalBreakTime: { $sum: "$breakTime" },
        },
      },
    ]);

    const result = dateWiseData.map((entry) => {
      if (
        entry.totalWorkingTime !== undefined &&
        entry.totalBreakTime !== undefined
      ) {
        const workingHours = entry.totalWorkingTime - entry.totalBreakTime;
        const hours = Math.floor(workingHours / 3600);
        const minutes = Math.floor((workingHours % 3600) / 60);
        const totalMinutes = hours * 60 + minutes;
        
        if (totalMinutes >= 7.5 * 60) {
          entry.attendance = "Present";
        } else if (totalMinutes >= 3.5 * 60 && totalMinutes < 7.5 * 60) {
          entry.attendance = "HalfDay";
        } else {
          entry.attendance = "Absent";
        }

        entry.formattedWorkingHours = `${hours} hours ${minutes} minutes`;
      } else {
        entry.attendance = "Data Error";
        entry.formattedWorkingHours = "N/A";
      }

      return entry;
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching date-wise data:", error);
    res.status(500).json({ error: "Unable to fetch attendance data. Please try again later." });
  }
};

exports.getAdminAttendance = async (req, res) => {
  try {
    const { employee, month, year } = req.query;
    const matchConditions = {};

    if (employee) {
      matchConditions.employeeName = { $regex: new RegExp(employee, "i") };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      matchConditions.punchIn = { $gte: startDate, $lte: endDate };
    }

    const groupedAttendance = await Attendance.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            employeeId: "$employeeId",
            employeeName: "$employeeName",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$punchIn" } },
          },
          punches: { $push: "$$ROOT" },
        },
      },
      {
        $group: {
          _id: "$_id.employeeId",
          employeeNameSet: { $addToSet: "$_id.employeeName" },
          attendance: {
            $push: {
              date: "$_id.date",
              punches: "$punches",
            },
          },
        },
      },
      {
        $set: {
          employeeName: { $arrayElemAt: ["$employeeNameSet", 0] },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedAttendance = groupedAttendance.map((employeeAttendance) => {
      const updatedAttendance = employeeAttendance.attendance.map(
        (dailyAttendance) => {
          const { punches } = dailyAttendance;

          const totalWorkingTime = punches.reduce((acc, punch) => {
            return acc + (punch.totalWorkingTime || 0);
          }, 0);

          const hours = totalWorkingTime / 3600;
          const roundedHoursNumber = parseFloat(hours.toFixed(2));

          let attendanceStatus;
          if (roundedHoursNumber >= 7.5) {
            attendanceStatus = "Present";
          } else if (roundedHoursNumber >= 3.5 && roundedHoursNumber <= 7.4) {
            attendanceStatus = "Half Day";
          } else {
            attendanceStatus = "Absent";
          }

          return {
            date: dailyAttendance.date,
            totalWorkingTime,
            totalBreakTime: punches.reduce(
              (acc, punch) => acc + (punch.breakTime || 0),
              0
            ),
            punches,
            attendanceStatus,
          };
        }
      );

      return {
        _id: employeeAttendance._id,
        employeeName: employeeAttendance.employeeName,
        attendance: updatedAttendance,
      };
    });

    res.json(formattedAttendance);
  } catch (error) {
    console.error("Error fetching admin attendance:", error);
    res.status(500).json({ error: "Unable to fetch attendance records. Please try again later." });
  }
};
