const {Teacher} = require('../model/model');

const getTeachersName = async (req, res) => {
    // const { phase } = req.params;
  
    try {
      // Fetch schedules matching the phase
      const teachers = await Teacher.find({});
  
      if (teachers.length === 0) {
        return res.status(404).json({ message: `No Teachers found.` });
      }
  
      res.status(200).json({ message: `Teachers fetched successfully.`, data: teachers });
    } catch (error) {
      res.status(500).json({ message: `Error fetching Teachers.`, error: error.message });
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

