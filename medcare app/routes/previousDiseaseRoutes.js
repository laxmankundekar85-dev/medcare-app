import express from 'express';
import PreviousDisease from '../models/PreviousDisease.js';

const router = express.Router();

// Get all medical history entries for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const diseases = await PreviousDisease.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new disease or condition
router.post('/', async (req, res) => {
  try {
    const newDisease = new PreviousDisease(req.body);
    const savedDisease = await newDisease.save();
    res.status(201).json(savedDisease);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a disease record
router.delete('/:id', async (req, res) => {
  try {
    await PreviousDisease.findByIdAndDelete(req.params.id);
    res.json({ message: 'Disease record removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;