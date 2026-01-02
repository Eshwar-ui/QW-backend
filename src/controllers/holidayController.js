const Holidays = require("../models/Holidays");
const { format } = require("date-fns");

exports.addHoliday = async (req, res) => {
  try {
    const { title, date, action } = req.body;

    const day = format(new Date(date), "EEEE"); 

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Holiday title is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "Holiday date is required" });
    }

    const existingHoliday = await Holidays.findOne({ date });
    if (existingHoliday) {
      return res
        .status(409)
        .json({ error: "A holiday already exists for this date. Please select a different date or update the existing holiday." });
    }

    const newHoliday = new Holidays({
      title,
      date,
      day,
      action: "HR",
    });

    await newHoliday.save();
    res.status(201).json({ message: "Holiday added successfully" });
  } catch (error) {
    console.error("Error adding holiday:", error);
    res.status(500).json({ error: "Unable to add holiday. Please try again later." });
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

    const holiday = await Holidays.findById(id);
    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found." });
    }

    await Holidays.findByIdAndUpdate(
      id,
      { title, date, day },
      { new: true }
    );

    res.json({ message: "Holiday updated successfully" });
  } catch (error) {
    console.error("Error updating holiday:", error);
    res.status(500).json({ error: "Unable to update holiday. Please try again later." });
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
