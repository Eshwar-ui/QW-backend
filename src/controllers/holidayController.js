const Holidays = require("../models/Holidays");
const { format, parse } = require("date-fns");

// Helper function to parse date from various formats
function parseDate(dateString) {
  if (!dateString) {
    throw new Error("Date string is required");
  }

  // Try ISO format first (yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss)
  let parsedDate = new Date(dateString);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  // Try dd-MM-yyyy format
  try {
    parsedDate = parse(dateString, "dd-MM-yyyy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } catch (e) {
    // Continue to next format
  }

  // Try MM-dd-yyyy format
  try {
    parsedDate = parse(dateString, "MM-dd-yyyy", new Date());
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  } catch (e) {
    // Continue to next format
  }

  throw new Error(`Invalid date format: ${dateString}. Expected format: yyyy-MM-dd or dd-MM-yyyy`);
}

exports.addHoliday = async (req, res) => {
  try {
    const { title, date, action } = req.body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Holiday title is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "Holiday date is required" });
    }

    // Parse and validate date
    let parsedDate;
    try {
      parsedDate = parseDate(date);
    } catch (dateError) {
      console.error("Date parsing error:", dateError.message);
      return res.status(400).json({ 
        error: dateError.message || "Invalid date format. Please use yyyy-MM-dd or dd-MM-yyyy format." 
      });
    }

    // Format day name
    let day;
    try {
      day = format(parsedDate, "EEEE");
    } catch (formatError) {
      console.error("Day formatting error:", formatError);
      return res.status(400).json({ 
        error: "Failed to process date. Please ensure the date is valid." 
      });
    }

    // Check for duplicate holiday on the same date
    // Normalize date to start of day for comparison
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingHoliday = await Holidays.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingHoliday) {
      return res
        .status(409)
        .json({ error: "A holiday already exists for this date. Please select a different date or update the existing holiday." });
    }

    // Create new holiday
    const newHoliday = new Holidays({
      title: title.trim(),
      date: parsedDate,
      day: day,
      action: action && action.trim() ? action.trim() : "HR",
    });

    await newHoliday.save();
    res.status(201).json({ message: "Holiday added successfully" });
  } catch (error) {
    console.error("Error adding holiday:", error);
    
    // Handle Mongoose validation errors
    if (error && error.name === "ValidationError") {
      const fields = Object.keys(error.errors || {});
      const message = fields.length > 0
        ? `Missing/invalid fields: ${fields.join(", ")}`
        : "Invalid holiday data. Please check required fields.";
      return res.status(400).json({ error: message });
    }

    // Handle duplicate key errors (if unique index exists)
    if (error && error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];
      const duplicateValue = duplicateField && error.keyValue ? error.keyValue[duplicateField] : "";
      return res.status(409).json({
        error: duplicateField
          ? `A holiday with this ${duplicateField} already exists. Please use a different value.`
          : "Duplicate entry detected. Please use different values.",
      });
    }

    // Generic error
    res.status(500).json({ 
      error: error.message || "Unable to add holiday. Please try again later." 
    });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holidays.find();
    const formattedHolidays = holidays.map((holiday) => ({
      ...holiday._doc,
      date: format(new Date(holiday.date), "dd-MM-yyyy"),
    }));
    res.json(formattedHolidays);
  } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ error: "Unable to fetch holidays. Please try again later." });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { title, date, day } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Holiday ID is required" });
    }

    const holiday = await Holidays.findById(id);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found." });
    }

    // Validate title if provided
    if (title !== undefined && (!title || title.trim() === "")) {
      return res.status(400).json({ error: "Holiday title cannot be empty" });
    }

    // Parse and validate date if provided
    let parsedDate = holiday.date; // Keep existing date if not provided
    if (date) {
      try {
        parsedDate = parseDate(date);
      } catch (dateError) {
        console.error("Date parsing error:", dateError.message);
        return res.status(400).json({ 
          error: dateError.message || "Invalid date format. Please use yyyy-MM-dd or dd-MM-yyyy format." 
        });
      }
    }

    // Format day name if date is provided
    let dayName = day || holiday.day;
    if (date) {
      try {
        dayName = format(parsedDate, "EEEE");
      } catch (formatError) {
        console.error("Day formatting error:", formatError);
        return res.status(400).json({ 
          error: "Failed to process date. Please ensure the date is valid." 
        });
      }
    }

    // Check for duplicate holiday on the same date (excluding current holiday)
    if (date) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingHoliday = await Holidays.findOne({
        _id: { $ne: id },
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (existingHoliday) {
        return res
          .status(409)
          .json({ error: "A holiday already exists for this date. Please select a different date." });
      }
    }

    await Holidays.findByIdAndUpdate(
      id,
      { 
        ...(title && { title: title.trim() }), 
        ...(date && { date: parsedDate }), 
        ...(dayName && { day: dayName }) 
      },
      { new: true, runValidators: true }
    );

    res.json({ message: "Holiday updated successfully" });
  } catch (error) {
    console.error("Error updating holiday:", error);
    
    // Handle Mongoose validation errors
    if (error && error.name === "ValidationError") {
      const fields = Object.keys(error.errors || {});
      const message = fields.length > 0
        ? `Missing/invalid fields: ${fields.join(", ")}`
        : "Invalid holiday data. Please check required fields.";
      return res.status(400).json({ error: message });
    }

    // Handle duplicate key errors
    if (error && error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];
      return res.status(409).json({
        error: duplicateField
          ? `A holiday with this ${duplicateField} already exists. Please use a different value.`
          : "Duplicate entry detected. Please use different values.",
      });
    }

    res.status(500).json({ 
      error: error.message || "Unable to update holiday. Please try again later." 
    });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holidays.findById(id);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found." });
    }

    await Holidays.findByIdAndDelete(id);

    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ error: "Unable to delete holiday. Please try again later." });
  }
};
