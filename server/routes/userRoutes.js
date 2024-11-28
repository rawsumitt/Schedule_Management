const express = require('express');
const router = express.Router();
const { createSchedulePhase ,getSchedulesByPhase} = require('../controller/userController');

// Route to add a schedule for any phase
router.post('/add', createSchedulePhase);

router.get('/:phase', getSchedulesByPhase);


module.exports = router;
