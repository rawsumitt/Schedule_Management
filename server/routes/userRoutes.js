const express = require('express');
const router = express.Router();
const { createSchedulePhase ,getSchedulesByPhase, updateSchedulePhase, deleteSchedulePhase} = require('../controller/userController');

// Route to add a schedule for any phase
router.post('/add', createSchedulePhase);
router.put('/update', updateSchedulePhase);
router.post('/delete', deleteSchedulePhase);

router.get('/:phase', getSchedulesByPhase);


module.exports = router;
