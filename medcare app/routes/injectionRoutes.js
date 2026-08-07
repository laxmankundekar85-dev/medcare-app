import express from 'express';
import Injection from '../models/Injection.js';

const router = express.Router();

// Fetch all injections for a user
router.get('/:userId', async (req, res) => {
  try {
    const injections = await Injection.find({ userId: req.params.userId });
    res.json(injections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new injection entry
router.post('/', async (req, res) => {
  try {
    const newInj = new Injection(req.body);
    const savedInj = await newInj.save();
    res.status(201).json(savedInj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an injection entry
router.delete('/:id', async (req, res) => {
  try {
    await Injection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Injection record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;