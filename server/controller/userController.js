const { Schedule } = require('../model/model');

// const createSchedulePhase = async (req, res) => {
//   const { phase, date, start_time, end_time, subject, lect_type, teacher_name } = req.body;

//   try {
//     const newSchedule = new Schedule({
//       phase,
//       date,
//       start_time,
//       end_time,
//       subject,
//       lect_type,
//       teacher_name,
//     });

//     await newSchedule.save();
//     res.status(201).json({ message: `Schedule added successfully for ${phase}`, data: newSchedule });
//   } catch (error) {
//     res.status(500).json({ message: `Error creating schedule for ${phase}`, error: error.message });
//   }
// };

const createSchedulePhase = async (req, res) => {
  const scheduleEntries = req.body.events; // Assuming an array of objects is sent in the request body

  console.log(scheduleEntries)
  try {
    // Validate input
    if (!Array.isArray(scheduleEntries)) {
      return res.status(400).json({ message: "Invalid data format. Expected an array of objects." });
    }

    // Save all entries using `insertMany` for better performance
    const newSchedules = await Schedule.insertMany(scheduleEntries);

    res.status(201).json({
      message: `Schedules added successfully for ${scheduleEntries.length} entries.`,
      data: newSchedules,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating schedules", error: error.message });
  }
};



const getSchedulesByPhase = async (req, res) => {
    const { phase } = req.params;
  
    try {
      // Fetch schedules matching the phase
      const schedules = await Schedule.find({ phase });
  
      if (schedules.length === 0) {
        return res.status(404).json({ message: `No schedules found for phase "${phase}".` });
      }
  
      res.status(200).json({ message: `Schedules for phase "${phase}" fetched successfully.`, data: schedules });
    } catch (error) {
      res.status(500).json({ message: `Error fetching schedules for phase "${phase}".`, error: error.message });
    }
  };

module.exports = {
  createSchedulePhase,
  getSchedulesByPhase
};

