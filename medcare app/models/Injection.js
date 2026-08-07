import mongoose from 'mongoose';

const injectionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  dosage: { 
    type: String, 
    required: true 
  },
  site: { 
    type: String, 
    default: 'Arm' 
  },
  timing: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Pending' 
  }
}, { timestamps: true });

export default mongoose.model('Injection', injectionSchema);