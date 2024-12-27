const {Teacher,Schedule} = require('../model/model');

// const getTeachersName = async (req, res) => {
//     // const { phase } = req.params;
  
//     try {
//       // Fetch schedules matching the phase
//       const teachers = await Teacher.find({});
  
//       if (teachers.length === 0) {
//         return res.status(404).json({ message: `No Teachers found.` });
//       }
  
//       res.status(200).json({ message: `Teachers fetched successfully.`, data: teachers });
//     } catch (error) {
//       res.status(500).json({ message: `Error fetching Teachers.`, error: error.message });
//     }
//   };


const getTeachersName = async (req, res) => {
  const { date, start_time, end_time } = req.body; // Expect date and time range from frontend
  //matchig the format i.e. stored in DB
  const newDate = date.split('T')[0];

  console.log("Request Data:", { date, start_time, end_time }); // Log input data

  try {
    // Fetch all teachers
    const allTeachers = await Teacher.find({});
    console.log("All Teachers:", allTeachers); // Log all teachers

    if (allTeachers.length === 0) {
      return res.status(404).json({ message: "No teachers found." });
    }

    // Fetch schedules for the given date and overlapping time slots
    const schedules = await Schedule.find({
      date: new Date(newDate), // Match the date
      $or: [
        {
          start_time: { $lte: end_time }, // Schedule starts before the end of the new slot
          end_time: { $gt: start_time }, // And ends after the start of the new slot
        },
      ],
    });

    console.log("Schedules Found:", schedules); // Log fetched schedules

    // Extract busy teacher names from schedules
    const busyTeachers = schedules.map((schedule) => schedule.teacher_name);
    console.log("Busy Teachers:", busyTeachers); // Log busy teachers

    // Filter out busy teachers
    const freeTeachers = allTeachers.filter(
      (teacher) => !busyTeachers.includes(teacher.teacher_name)
    );

    console.log("Free Teachers:", freeTeachers); // Log free teachers

    if (freeTeachers.length === 0) {
      return res.status(200).json({ message: "No teachers are free at this time.", data: [] });
    }

    res.status(200).json({
      message: "Free teachers fetched successfully.",
      data: freeTeachers,
    });
  } catch (error) {
    console.error("Error:", error); // Log error
    res.status(500).json({ message: "Error fetching teachers.", error: error.message });
  }
};



  const addTeacher = async (req, res) => {
    const { teacher_name, email } = req.body;

    if (!teacher_name || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      const newTeacher = new Teacher({
        teacher_name,
        email,
      });
  
      await newTeacher.save();
      res.status(201).json({ message: "Teacher added successfully.", data: newTeacher });
    } catch (error) {
      res.status(500).json({ message: "Error adding teacher.", error: error.message });
    }
  };
  

module.exports = {
  getTeachersName,
  addTeacher
};

