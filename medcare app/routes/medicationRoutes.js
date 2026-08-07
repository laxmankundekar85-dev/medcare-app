// medcare app/routes/medicationRoutes.js
import express from 'express';
import Medication from '../models/Medication.js';

const router = express.Router();

// Fetch all medications for a user
router.get('/:userId', async (req, res) => {
  try {
    const meds = await Medication.find({ userId: req.params.userId });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new medication
router.post('/', async (req, res) => {
  try {
    const newMed = new Medication({
      ...req.body,
      status: req.body.status || 'Active'
    });
    const savedMed = await newMed.save();
    res.status(201).json(savedMed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Toggle taken status (Updates the 'status' field in MongoDB)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ error: 'Medication not found' });

    // Read target status from body, or toggle between 'Taken' and 'Active'
    if (req.body && req.body.status) {
      med.status = req.body.status;
    } else {
      med.status = (med.status === 'Taken' || med.status === 'Completed') ? 'Active' : 'Taken';
    }

    // Save changes to MongoDB
    await med.save();
    console.log(`✅ MongoDB updated: Medication "${med.name}" status is now "${med.status}"`);
    res.json(med);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a medication
router.delete('/:id', async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;