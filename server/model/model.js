const mongoose = require('mongoose');

// Schedule Schema
const scheduleSchema = new mongoose.Schema({
  phase: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  start_time: {
    type: String, // Store time as a string (HH:MM format)
    required: true,
  },
  end_time: {
    type: String, // Store time as a string (HH:MM format)
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  lect_type: {
    type: String,
    required: true,
  },
  teacher_name: {
    type: String,
    required: true,
  },
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  teacher_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures the email is unique for each teacher
  },
});

// Models
const Schedule = mongoose.model('Schedule', scheduleSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = { Schedule, Teacher };
