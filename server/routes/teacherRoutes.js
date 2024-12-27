const express = require('express');
const router = express.Router();
const {getTeachersName, addTeacher} = require('../controller/teacherController');

// Route to add a schedule for any phase
router.post('/fetch', getTeachersName);
router.post('/add', addTeacher);


module.exports = router;
