import express from 'express';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

// Get profile details by userId
router.get('/:userId', async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.params.userId });
    
    // Create default profile document if none exists yet
    if (!profile) {
      profile = new UserProfile({ userId: req.params.userId });
      await profile.save();
    }
    
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile details
router.put('/:userId', async (req, res) => {
  try {
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(updatedProfile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;