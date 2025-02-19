const express = require('express');
const { getWorkouts, createWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');

const router = express.Router();

router.get('/', getWorkouts); 
router.post('/', createWorkout); 
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
