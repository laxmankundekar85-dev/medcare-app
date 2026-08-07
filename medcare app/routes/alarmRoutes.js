import express from 'express';
import Alarm from '../models/Alarm.js';

const router = express.Router();

// Get all alarms for a user
router.get('/:userId', async (req, res) => {
  try {
    const alarms = await Alarm.find({ userId: req.params.userId });
    res.json(alarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new alarm
router.post('/', async (req, res) => {
  try {
    const newAlarm = new Alarm(req.body);
    const savedAlarm = await newAlarm.save();
    res.status(201).json(savedAlarm);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle enabled/disabled
router.patch('/:id/toggle', async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) return res.status(404).json({ error: 'Alarm not found' });
    alarm.isEnabled = !alarm.isEnabled;
    await alarm.save();
    res.json(alarm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete alarm
router.delete('/:id', async (req, res) => {
  try {
    await Alarm.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alarm deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;