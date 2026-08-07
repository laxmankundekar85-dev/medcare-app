import mongoose from 'mongoose';

const alarmSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  label: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  days: { 
    type: [String], 
    default: ['Daily'] 
  },
  isEnabled: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model('Alarm', alarmSchema);