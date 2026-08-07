import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// 1. GET: Fetch all appointments for a logged-in user
router.get('/:userId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Create / Book a new appointment
router.post('/', async (req, res) => {
  try {
    const newAppt = new Appointment(req.body);
    const savedAppt = await newAppt.save();
    res.status(201).json(savedAppt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. DELETE: Cancel / Remove an appointment
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;